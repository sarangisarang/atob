import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getAllShippings } from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

export default function CustomerOrdersScreen({ navigation }) {
  const { t } = useTranslation();
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [firstName, setFirstName] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Role-filtered: customer receives only their own shipments (rich data:
      // status, driver, vehicle, route, tracking).
      const [res, fn] = await Promise.all([
        getAllShippings(),
        AsyncStorage.getItem('firstName'),
      ]);
      setItems(res.data || []);
      setFirstName(fn || '');
    } catch {
      // silent — empty state shown
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('CustomerOrderDetail', { shipping: item })}
    >
      <View style={styles.cardRow}>
        <Text style={styles.orderId}>📦 #{item.id?.slice(0, 8)}</Text>
        <StatusBadge status={item.shippingStatus} type="shipping" />
      </View>
      <Text style={styles.route}>
        {item.fromCity ?? '—'} → {item.toCity ?? '—'}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {item.driverFirstName ? `🚚 ${item.driverFirstName}` : t('unassigned')}
          {item.vehiclePlateNumber ? ` · ${item.vehiclePlateNumber}` : ''}
        </Text>
        <Text style={styles.tapHint}>{t('orderDetails')} ›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 {t('myOrders')}</Text>
        <Text style={styles.headerSub}>{t('customerWelcome')}, {firstName || '...'}</Text>
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>{t('noMyOrders')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F7FA' },
  header:      { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  list:        { padding: 14, paddingBottom: 32 },
  card:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  cardRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:     { fontSize: 15, fontWeight: '800', color: '#222' },
  route:       { fontSize: 14, color: '#1a73e8', fontWeight: '700', marginBottom: 8 },
  metaRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta:        { fontSize: 12, color: '#666', flex: 1 },
  tapHint:     { fontSize: 12, color: '#1a73e8', fontWeight: '700' },
  emptyBox:    { alignItems: 'center', marginTop: 80 },
  emptyIcon:   { fontSize: 60, marginBottom: 14 },
  emptyText:   { fontSize: 15, color: '#aaa' },
});
