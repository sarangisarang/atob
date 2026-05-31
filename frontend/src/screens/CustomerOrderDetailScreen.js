import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, Image, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import {
  getShipping, getShippingCargo, getDeliveryProof, proofPhotoUrl,
} from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

const STEPS = ['CREATED', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
const STEP_KEYS = {
  CREATED: 'tl_created', ASSIGNED: 'tl_assigned', PICKUP_IN_PROGRESS: 'tl_pickup',
  PICKED_UP: 'tl_pickedup', IN_TRANSIT: 'tl_transit', DELIVERED: 'tl_delivered',
};

export default function CustomerOrderDetailScreen({ route }) {
  const { t } = useTranslation();
  const initial = route.params?.shipping || {};
  const [s, setS]         = useState(initial);
  const [cargo, setCargo] = useState([]);
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shipRes, cargoRes] = await Promise.all([
        getShipping(initial.id).catch(() => ({ data: initial })),
        getShippingCargo(initial.id).catch(() => ({ data: [] })),
      ]);
      const fresh = shipRes.data || initial;
      setS(fresh);
      setCargo(cargoRes.data || []);
      if (fresh.shippingStatus === 'DELIVERED') {
        const p = await getDeliveryProof(initial.id).catch(() => null);
        setProof(p?.data || null);
      } else {
        setProof(null);
      }
    } finally {
      setLoading(false);
    }
  }, [initial.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const status = s.shippingStatus;
  const terminalBad = status === 'CANCELLED' || status === 'FAILED';
  const currentIdx = STEPS.indexOf(status);

  const lat = Number(s.trackingLatitude)  || 41.6938;
  const lon = Number(s.trackingLongitude) || 44.8015;
  const mapHtml = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}</style></head>
<body><div id="map"></div><script>
var m=L.map('map').setView([${lat},${lon}],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);
L.marker([${lat},${lon}]).addTo(m).bindPopup('📦').openPopup();
</script></body></html>`;

  if (loading && !s.id) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a73e8" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📦 #{s.id?.slice(0, 8)}</Text>
          <StatusBadge status={status} type="shipping" />
        </View>
        {s.transportType && <Text style={styles.headerSub}>{s.transportType}</Text>}
      </View>

      {/* Status timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('statusLabel')}</Text>
        {terminalBad ? (
          <View style={styles.badRow}>
            <Text style={styles.badText}>
              {status === 'CANCELLED' ? t('tl_cancelled') : t('tl_failed')}
            </Text>
          </View>
        ) : (
          STEPS.map((step, i) => {
            const done   = currentIdx >= i;
            const active = currentIdx === i;
            return (
              <View key={step} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                    {done && <Text style={styles.dotCheck}>{active ? '●' : '✓'}</Text>}
                  </View>
                  {i < STEPS.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
                </View>
                <Text style={[styles.tlLabel, active && styles.tlLabelActive, done && styles.tlLabelDone]}>
                  {t(STEP_KEYS[step])}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Route */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('route')}</Text>
        <Row label={t('from')} value={s.fromCity ? `${s.fromCity}${s.fromAddress ? ', ' + s.fromAddress : ''}` : '—'} />
        <Row label={t('to')}   value={s.toCity   ? `${s.toCity}${s.toAddress ? ', ' + s.toAddress : ''}` : '—'} />
        {s.deliveryEndAt && <Row label={t('deliveredDate')} value={s.deliveryEndAt} />}
      </View>

      {/* Driver + Vehicle */}
      {(s.driverFirstName || s.vehiclePlateNumber) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('driver')} · {t('shippingSection')}</Text>
          {s.driverFirstName && <Row label={t('driver')} value={`${s.driverFirstName} ${s.driverLastName || ''}`} />}
          {s.vehiclePlateNumber && <Row label="Vehicle" value={`${s.vehicleType || ''} · ${s.vehiclePlateNumber}`} />}
        </View>
      )}

      {/* Live map */}
      <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
        <WebView style={styles.map} originWhitelist={['*']} source={{ html: mapHtml }} javaScriptEnabled />
      </View>

      {/* Cargo */}
      {cargo.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('productSection')}</Text>
          {cargo.map((c) => (
            <Row key={c.id} label={c.name} value={`${c.cargoType || ''}${c.weightKg ? ' · ' + c.weightKg + 'kg' : ''}`} />
          ))}
        </View>
      )}

      {/* Proof of Delivery */}
      {proof && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ {t('proofTitle')}</Text>
          {proof.receiverName && <Row label={t('receiver')} value={proof.receiverName} />}
          {proof.deliveredAt && <Row label={t('deliveredDate')} value={String(proof.deliveredAt).slice(0, 16).replace('T', ' ')} />}
          {proof.notes && <Row label={t('description')} value={proof.notes} />}
          {proof.hasPhoto && (
            <Image source={{ uri: proofPhotoUrl(s.id) }} style={styles.proofPhoto} resizeMode="cover" />
          )}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F7FA' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  header:      { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  card:        { backgroundColor: '#fff', borderRadius: 14, padding: 16, margin: 14, marginBottom: 0, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  cardTitle:   { fontSize: 12, fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  // timeline
  tlRow:       { flexDirection: 'row', alignItems: 'flex-start' },
  tlLeft:      { alignItems: 'center', width: 28 },
  dot:         { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D0D5DD', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotDone:     { borderColor: '#1a73e8', backgroundColor: '#1a73e8' },
  dotActive:   { borderColor: '#0b57d0', backgroundColor: '#1a73e8' },
  dotCheck:    { color: '#fff', fontSize: 11, fontWeight: '800' },
  line:        { width: 2, height: 26, backgroundColor: '#E0E0E0' },
  lineDone:    { backgroundColor: '#1a73e8' },
  tlLabel:     { fontSize: 14, color: '#999', marginLeft: 10, paddingTop: 1, flex: 1 },
  tlLabelDone: { color: '#444' },
  tlLabelActive:{ color: '#1a73e8', fontWeight: '800' },
  badRow:      { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12 },
  badText:     { color: '#C62828', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  // rows
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel:    { fontSize: 13, color: '#888', flexShrink: 0, marginRight: 10 },
  rowValue:    { fontSize: 13, color: '#333', fontWeight: '600', flex: 1, textAlign: 'right' },
  map:         { height: 240, width: '100%' },
  proofPhoto:  { width: '100%', height: 200, borderRadius: 10, marginTop: 10, backgroundColor: '#eee' },
});
