import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import {
  updateCoordinates,
  startPickup,
  pickedUp,
  inTransit,
  deliverShipping,
} from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

export default function GPSTrackingScreen({ route }) {
  const { t } = useTranslation();
  const { shipping: initialShipping } = route.params;
  const [shipping, setShipping] = useState(initialShipping);
  const [locating, setLocating] = useState(false);
  const [acting,   setActing]   = useState(false);

  const lat = Number(shipping?.trackingLatitude)  || 41.6938;
  const lon = Number(shipping?.trackingLongitude) || 44.8015;

  const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lon}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {attribution:'© OpenStreetMap'}).addTo(map);
    L.marker([${lat}, ${lon}])
      .addTo(map)
      .bindPopup('<b>📦 ${shipping?.id?.slice(0, 8) ?? ''}</b>')
      .openPopup();
  </script>
</body>
</html>`;

  const handleUpdateLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('GPS', t('permissionDenied')); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const res = await updateCoordinates(shipping.id, latitude, longitude);
      setShipping(res.data);
      Alert.alert('✓', `${t('locationUpdated')}\n${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } catch { Alert.alert(t('error'), t('locationError')); }
    finally { setLocating(false); }
  };

  const handleTransition = async (apiFn) => {
    setActing(true);
    try {
      const res = await apiFn(shipping.id);
      setShipping(res.data);
    } catch (err) {
      Alert.alert(t('error'), err.response?.data || t('actionError'));
    } finally { setActing(false); }
  };

  const s = shipping;

  return (
    <View style={styles.container}>
      <WebView style={styles.map} originWhitelist={['*']} source={{ html: mapHtml }} javaScriptEnabled />

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>{t('statusLabel')}:</Text>
          <StatusBadge status={s?.shippingStatus} type="shipping" />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Latitude</Text>
          <Text style={styles.value}>{lat.toFixed(6)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Longitude</Text>
          <Text style={styles.value}>{lon.toFixed(6)}</Text>
        </View>

        {s?.driverFirstName && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('driver')}</Text>
            <Text style={styles.value}>{s.driverFirstName} {s.driverLastName}</Text>
          </View>
        )}

        {s?.vehiclePlateNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{s.vehicleType} · {s.vehiclePlateNumber}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnBlue, locating && styles.disabled]}
          onPress={handleUpdateLocation} disabled={locating}
        >
          {locating ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t('updateLocation')}</Text>}
        </TouchableOpacity>

        {s?.shippingStatus === 'ASSIGNED' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#E65100' }, acting && styles.disabled]}
            onPress={() => handleTransition(startPickup)} disabled={acting}
          >
            {acting ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>▶ Start Pickup</Text>}
          </TouchableOpacity>
        )}

        {s?.shippingStatus === 'PICKUP_IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#F57F17' }, acting && styles.disabled]}
            onPress={() => handleTransition(pickedUp)} disabled={acting}
          >
            {acting ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>📦 {t('pickUp')}</Text>}
          </TouchableOpacity>
        )}

        {s?.shippingStatus === 'PICKED_UP' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#283593' }, acting && styles.disabled]}
            onPress={() => handleTransition(inTransit)} disabled={acting}
          >
            {acting ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>🚛 Start Transit</Text>}
          </TouchableOpacity>
        )}

        {s?.shippingStatus === 'IN_TRANSIT' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#2E7D32' }, acting && styles.disabled]}
            onPress={() => handleTransition(deliverShipping)} disabled={acting}
          >
            {acting ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>✅ {t('deliver')}</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F7FA' },
  map:          { flex: 1, minHeight: 280 },
  panel:        { maxHeight: 360, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  panelContent: { padding: 16, paddingBottom: 28 },
  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label:        { fontSize: 13, color: '#888' },
  value:        { fontSize: 13, color: '#333', fontWeight: '600' },
  btn:          { borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 10 },
  btnBlue:      { backgroundColor: '#1a73e8' },
  btnText:      { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabled:     { opacity: 0.6 },
});
