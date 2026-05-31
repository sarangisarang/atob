import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getOrder, updateOrderStatus, cancelOrder,
  getShippingByOrder, assignCarrier, getDrivers,
} from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

const ACTION_KEYS = {
  Pending:        [{ key: 'processing',    endpoint: 'processing',    color: '#1a73e8' },
                   { key: 'cancel',        endpoint: 'cancel',        color: '#C62828' }],
  Processing:     [{ key: 'waitingCarrier',endpoint: 'waitingCarrier',color: '#E65100' }],
  WaitingCarrier: [{ key: 'shipped',       endpoint: 'shipped',       color: '#7B1FA2' }],
  Shipped:        [{ key: 'delivered',     endpoint: 'delivered',     color: '#2E7D32' }],
  Delivered:      [],
  Cancelled:      [],
};

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const [order,         setOrder]         = useState(null);
  const [shipping,      setShipping]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [acting,        setActing]        = useState(false);
  const [showAssign,    setShowAssign]    = useState(false);
  const [drivers,       setDrivers]       = useState([]);
  const [assigning,     setAssigning]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, shippingRes] = await Promise.all([
        getOrder(orderId),
        getShippingByOrder(orderId).catch(() => null),
      ]);
      setOrder(orderRes.data);
      setShipping(shippingRes?.data ?? null);
    } catch {
      Alert.alert(t('error'), t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleAction = (endpoint) => {
    Alert.alert(t('confirmAction'), t('confirmMsg'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        onPress: async () => {
          setActing(true);
          try {
            if (endpoint === 'cancel') {
              await cancelOrder(orderId);
            } else {
              await updateOrderStatus(orderId, endpoint);
            }
            await fetchData();
          } catch (err) {
            Alert.alert(t('error'), err.response?.data || t('actionError'));
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const openAssignModal = async () => {
    try {
      const res = await getDrivers();
      setDrivers(res.data || []);
    } catch {
      Alert.alert(t('error'), t('loadError'));
      return;
    }
    setShowAssign(true);
  };

  const handleAssign = async (carrierId) => {
    setAssigning(true);
    try {
      await assignCarrier(shipping.id, carrierId);
      setShowAssign(false);
      await fetchData();
      Alert.alert('✓', t('driverAssigned'));
    } catch (e) {
      Alert.alert(t('error'), e.response?.data || t('actionError'));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (!order) return null;

  const actions = ACTION_KEYS[order.orderStatus] ?? [];

  return (
    <>
    <Modal visible={showAssign} transparent animationType="slide" onRequestClose={() => setShowAssign(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('selectDriver')}</Text>
          {assigning
            ? <ActivityIndicator size="large" color="#1a73e8" style={{ margin: 20 }} />
            : drivers.length === 0
              ? <Text style={styles.modalEmpty}>{t('noDriverAvailable')}</Text>
              : (
                <FlatList
                  data={drivers}
                  keyExtractor={(d) => d.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.driverItem} onPress={() => handleAssign(item.id)}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverInitials}>
                          {(item.firstName?.[0] ?? '') + (item.lastName?.[0] ?? '')}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.driverName}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.driverEmail}>{item.email}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
          <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAssign(false)}>
            <Text style={styles.modalCancelText}>{t('no')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <Text style={styles.heroId}>#{order.orderId || order.id.slice(0, 8)}</Text>
          <StatusBadge status={order.orderStatus} />
        </View>
        <Text style={styles.heroRoute}>
          {order.shippingFrom?.city ?? '—'} → {order.shippingTo?.city ?? '—'}
        </Text>
      </View>

      {/* Dates */}
      <Section title={t('orderDetails')}>
        <InfoRow label={t('orderNo')}       value={order.orderNo} />
        <InfoRow label={t('orderDate')}     value={order.orderDate} />
        <InfoRow label={t('shippingDate')}  value={order.shippingDate} />
        <InfoRow label={t('deliveredDate')} value={order.deliveredDate} />
      </Section>

      {/* Route */}
      <Section title={t('route')}>
        <InfoRow label={t('from')} value={`${order.shippingFrom?.address ?? ''}, ${order.shippingFrom?.city ?? ''}`} />
        <InfoRow label={t('to')}   value={`${order.shippingTo?.address ?? ''}, ${order.shippingTo?.city ?? ''}`} />
      </Section>

      {/* Customer */}
      <Section title={t('customerSection')}>
        <InfoRow label={t('name')}  value={`${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`} />
        <InfoRow label={t('email')} value={order.customer?.email} />
        <InfoRow label={t('phone')} value={order.customer?.phone} />
        <InfoRow label={t('city')}  value={order.customer?.city} />
      </Section>

      {/* Product */}
      <Section title={t('productSection')}>
        <InfoRow label={t('name')}        value={order.product?.productName} />
        <InfoRow label={t('description')} value={order.product?.productDesc} />
        <InfoRow label={t('stock')}       value={order.product?.stock} />
      </Section>

      {/* Shipping */}
      {shipping && (
        <Section title={t('shippingSection')}>
          <View style={styles.statusRow}>
            <Text style={styles.infoLabel}>{t('statusLabel')}</Text>
            <StatusBadge status={shipping.shippingStatus} type="shipping" />
          </View>
          <InfoRow
            label={t('driver')}
            value={shipping.driverFirstName
              ? `${shipping.driverFirstName} ${shipping.driverLastName}`
              : t('unassigned')}
          />
          {shipping.vehiclePlateNumber && (
            <InfoRow label="Vehicle" value={`${shipping.vehicleType ?? ''} · ${shipping.vehiclePlateNumber}`} />
          )}
          {!shipping.carrierId && (
            <TouchableOpacity style={styles.assignBtn} onPress={openAssignModal}>
              <Text style={styles.assignBtnText}>{t('assignDriver')}</Text>
            </TouchableOpacity>
          )}
          <InfoRow label="GPS Lat" value={shipping.trackingLatitude} />
          <InfoRow label="GPS Lon" value={shipping.trackingLongitude} />
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('GPSTracking', { shipping })}
          >
            <Text style={styles.trackBtnText}>{t('trackGPS')}</Text>
          </TouchableOpacity>
        </Section>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <Section title={t('actionsSection')}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.endpoint}
              style={[styles.actionBtn, { backgroundColor: a.color }, acting && styles.disabled]}
              onPress={() => handleAction(a.endpoint)}
              disabled={acting}
              activeOpacity={0.8}
            >
              {acting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.actionBtnText}>{t(`action.${a.key}`)}</Text>}
            </TouchableOpacity>
          ))}
        </Section>
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F5F7FA' },
  content:       { padding: 14, paddingBottom: 40 },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard:      { backgroundColor: '#1a73e8', borderRadius: 16, padding: 18, marginBottom: 12 },
  heroRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroId:        { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroRoute:     { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  section:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel:     { fontSize: 13, color: '#888', flex: 1 },
  infoValue:     { fontSize: 13, color: '#333', fontWeight: '600', flex: 2, textAlign: 'right' },
  statusRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  trackBtn:      { marginTop: 10, backgroundColor: '#17A2B8', borderRadius: 10, padding: 12, alignItems: 'center' },
  trackBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionBtn:       { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  actionBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabled:        { opacity: 0.6 },
  assignBtn:       { marginTop: 10, backgroundColor: '#5C6BC0', borderRadius: 10, padding: 11, alignItems: 'center' },
  assignBtnText:   { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalTitle:      { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 14, textAlign: 'center' },
  modalEmpty:      { textAlign: 'center', color: '#aaa', marginVertical: 20 },
  driverItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  driverAvatar:    { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverInitials:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  driverName:      { fontSize: 14, fontWeight: '700', color: '#333' },
  driverEmail:     { fontSize: 12, color: '#888', marginTop: 1 },
  modalCancel:     { marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
  modalCancelText: { color: '#666', fontWeight: '700' },
});
