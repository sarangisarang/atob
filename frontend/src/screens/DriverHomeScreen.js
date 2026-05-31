import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import {
  getAllShippings,
  getAvailableShippings,
  acceptShipping,
  updateCoordinates,
  startPickup,
  pickedUp,
  inTransit,
  deliverShipping,
} from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

const ACTIVE_STATUSES = ['ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT'];

export default function DriverHomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [carrierId, setCarrierId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [shipping,  setShipping]  = useState(null);
  const [available, setAvailable] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [locating,  setLocating]  = useState(false);
  const [acting,    setActing]    = useState(false);
  const [accepting, setAccepting] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    AsyncStorage.multiGet(['carrierId', 'firstName']).then(([cid, fn]) => {
      setCarrierId(cid[1]);
      setFirstName(fn[1] || '');
    });
  }, []);

  const fetchMyShipment = useCallback(async () => {
    if (!carrierId) return;
    setLoading(true);
    try {
      // Role-filtered — driver receives only own shippings
      const res = await getAllShippings();
      const mine = (res.data || []).find(s => ACTIVE_STATUSES.includes(s.shippingStatus));
      setShipping(mine || null);
      // No active job → show the marketplace of unclaimed orders to pick up
      if (!mine) {
        const av = await getAvailableShippings().catch(() => ({ data: [] }));
        setAvailable(av.data || []);
      } else {
        setAvailable([]);
      }
    } catch {
      // silent — empty state shown
    } finally {
      setLoading(false);
    }
  }, [carrierId]);

  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      await acceptShipping(id);
      await fetchMyShipment();   // claimed order becomes the active job
    } catch (e) {
      Alert.alert(t('error'), e.response?.data || t('actionError'));
      await fetchMyShipment();   // refresh in case another driver took it
    } finally {
      setAccepting(null);
    }
  };

  useFocusEffect(useCallback(() => { fetchMyShipment(); }, [fetchMyShipment]));

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (['IN_TRANSIT', 'PICKED_UP'].includes(shipping?.shippingStatus)) {
      intervalRef.current = setInterval(fetchMyShipment, 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [shipping?.shippingStatus, fetchMyShipment]);

  const handleUpdateLocation = async () => {
    if (!shipping) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('GPS', t('permissionDenied')); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const res = await updateCoordinates(shipping.id, latitude, longitude);
      setShipping(res.data);
      Alert.alert('✓', `${t('locationUpdated')}\n${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } catch { Alert.alert(t('error'), t('locationError')); }
    finally { setLocating(false); }
  };

  const handleTransition = async (apiFn) => {
    setActing(true);
    try {
      const res = await apiFn(shipping.id);
      setShipping(res.data);
      if (res.data?.shippingStatus === 'DELIVERED') setShipping(null);
    } catch (e) {
      Alert.alert(t('error'), e.response?.data || t('actionError'));
    } finally { setActing(false); }
  };

  const lat = Number(shipping?.trackingLatitude)  || 41.6938;
  const lon = Number(shipping?.trackingLongitude) || 44.8015;

  const mapHtml = `<!DOCTYPE html><html>
<head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}</style></head>
<body><div id="map"></div>
<script>
var map=L.map('map').setView([${lat},${lon}],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([${lat},${lon}]).addTo(map).bindPopup('📦').openPopup();
</script></body></html>`;

  const s = shipping;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 {t('driverWelcome')}, {firstName || '...'}</Text>
        <Text style={styles.headerSub}>{t('myShipment')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
      ) : !s ? (
        <ScrollView
          contentContainerStyle={styles.availableContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMyShipment} />}
        >
          <Text style={styles.availableTitle}>{t('availableOrders')}</Text>
          {available.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>{t('noAvailableOrders')}</Text>
            </View>
          ) : (
            available.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardRoute}>
                    {(o.fromCity || '—')} → {(o.toCity || '—')}
                  </Text>
                  {o.transportType && <Text style={styles.cardType}>{o.transportType}</Text>}
                </View>
                {(o.fromAddress || o.toAddress) && (
                  <Text style={styles.cardAddr}>
                    {o.fromAddress || ''}{o.toAddress ? '  →  ' + o.toAddress : ''}
                  </Text>
                )}
                {o.deliveryEndAt && (
                  <Text style={styles.cardMeta}>📅 {String(o.deliveryEndAt).slice(0, 10)}</Text>
                )}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#2E7D32', marginTop: 10 }, accepting && styles.disabled]}
                  onPress={() => handleAccept(o.id)}
                  disabled={!!accepting}
                >
                  {accepting === o.id
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>✅ {t('acceptOrder')}</Text>}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.flex}>
          <WebView style={styles.map} originWhitelist={['*']} source={{ html: mapHtml }} javaScriptEnabled />

          <ScrollView
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMyShipment} />}
          >
            <View style={styles.statusRow}>
              <Text style={styles.label}>{t('statusLabel')}</Text>
              <StatusBadge status={s.shippingStatus} type="shipping" />
            </View>

            {s.fromCity && <InfoRow label={t('from')} value={`${s.fromCity}${s.fromAddress ? ' — ' + s.fromAddress : ''}`} />}
            {s.toCity   && <InfoRow label={t('to')}   value={`${s.toCity}${s.toAddress ? ' — ' + s.toAddress : ''}`} />}
            {s.vehiclePlateNumber && (
              <InfoRow label="Vehicle" value={`${s.vehicleType ?? ''} · ${s.vehiclePlateNumber}`} />
            )}
            <InfoRow label="Lat" value={lat.toFixed(5)} />
            <InfoRow label="Lon" value={lon.toFixed(5)} />

            <TouchableOpacity
              style={[styles.btn, styles.btnBlue, locating && styles.disabled]}
              onPress={handleUpdateLocation} disabled={locating}
            >
              {locating ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{t('updateLocation')}</Text>}
            </TouchableOpacity>

            {s.shippingStatus === 'ASSIGNED' && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#E65100' }, acting && styles.disabled]}
                onPress={() => handleTransition(startPickup)} disabled={acting}
              >
                {acting ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>▶ Start Pickup</Text>}
              </TouchableOpacity>
            )}

            {s.shippingStatus === 'PICKUP_IN_PROGRESS' && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#F57F17' }, acting && styles.disabled]}
                onPress={() => handleTransition(pickedUp)} disabled={acting}
              >
                {acting ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>📦 {t('pickUp')}</Text>}
              </TouchableOpacity>
            )}

            {s.shippingStatus === 'PICKED_UP' && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#283593' }, acting && styles.disabled]}
                onPress={() => handleTransition(inTransit)} disabled={acting}
              >
                {acting ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>🚛 Start Transit</Text>}
              </TouchableOpacity>
            )}

            {s.shippingStatus === 'IN_TRANSIT' && (
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
      )}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F5F7FA' },
  flex:           { flex: 1 },
  header:         { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyIcon:      { fontSize: 60, marginBottom: 16 },
  emptyText:      { fontSize: 16, color: '#aaa', textAlign: 'center' },
  availableContent: { padding: 16, paddingBottom: 30 },
  availableTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#EEF1F5' },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRoute:      { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  cardType:       { fontSize: 11, fontWeight: '700', color: '#1a73e8', backgroundColor: '#E8F0FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  cardAddr:       { fontSize: 12, color: '#777', marginTop: 4 },
  cardMeta:       { fontSize: 12, color: '#555', marginTop: 6 },
  map:            { flex: 1, minHeight: 260 },
  panel:          { maxHeight: 360, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  panelContent:   { padding: 16, paddingBottom: 28 },
  statusRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label:          { fontSize: 13, color: '#888' },
  value:          { fontSize: 13, color: '#333', fontWeight: '600' },
  btn:            { borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 10 },
  btnBlue:        { backgroundColor: '#1a73e8' },
  btnText:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabled:       { opacity: 0.6 },
});
