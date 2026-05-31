import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStats, getOrders } from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

const STAT_CONFIG = [
  { key: 'total',         icon: '📋', primary: '#1a73e8', bg: '#E8F0FE' },
  { key: 'Pending',       icon: '⏳', primary: '#F9A825', bg: '#FFF8E1' },
  { key: 'Processing',    icon: '⚙️',  primary: '#0288D1', bg: '#E1F5FE' },
  { key: 'WaitingCarrier',icon: '🚚', primary: '#E65100', bg: '#FBE9E7' },
  { key: 'Shipped',       icon: '📦', primary: '#7B1FA2', bg: '#F3E5F5' },
  { key: 'Delivered',     icon: '✅', primary: '#2E7D32', bg: '#E8F5E9' },
  { key: 'Cancelled',     icon: '✕',  primary: '#C62828', bg: '#FFEBEE' },
];

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const [stats,   setStats]   = useState({});
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getStats(),
        getOrders(null),
      ]);
      setStats(statsRes.data || {});
      setRecent((ordersRes.data || []).slice(-6).reverse());
    } catch (e) {
      // silently degrade — partial data is fine on dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const goToOrder = (orderId) =>
    navigation.navigate('Orders', {
      screen: 'OrderDetail',
      params: { orderId },
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚛 ATOB</Text>
        <Text style={styles.headerSub}>{t('dashboard')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#1a73e8" />}
      >
        {loading && Object.keys(stats).length === 0 ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              {STAT_CONFIG.map(({ key, icon, primary, bg }) => (
                <View key={key} style={[styles.statCard, { backgroundColor: bg }]}>
                  <Text style={styles.statIcon}>{icon}</Text>
                  <Text style={[styles.statCount, { color: primary }]}>
                    {stats[key] ?? '—'}
                  </Text>
                  <Text style={[styles.statLabel, { color: primary }]}>
                    {t(`stat.${key}`)}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('recentOrders')}</Text>

            {recent.length === 0 ? (
              <Text style={styles.empty}>{t('noRecent')}</Text>
            ) : (
              recent.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => goToOrder(order.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.orderRow}>
                    <Text style={styles.orderNum}>
                      #{order.orderId || order.id.slice(0, 8)}
                    </Text>
                    <StatusBadge status={order.orderStatus} />
                  </View>
                  <Text style={styles.orderRoute}>
                    {order.shippingFrom?.city ?? '—'} → {order.shippingTo?.city ?? '—'}
                  </Text>
                  <Text style={styles.orderMeta}>
                    {order.customer?.firstName} {order.customer?.lastName}
                    {'  ·  '}{order.orderDate ?? ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F7FA' },
  header:       { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  logo:         { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content:      { padding: 16, paddingBottom: 32 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard:     { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center' },
  statIcon:     { fontSize: 26, marginBottom: 4 },
  statCount:    { fontSize: 28, fontWeight: '800' },
  statLabel:    { fontSize: 11, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  empty:        { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 14 },
  orderCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  orderRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  orderNum:     { fontSize: 14, fontWeight: '700', color: '#222' },
  orderRoute:   { fontSize: 13, color: '#1a73e8', fontWeight: '600' },
  orderMeta:    { fontSize: 12, color: '#888', marginTop: 3 },
});
