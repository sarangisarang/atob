import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getOrders, searchOrders } from '../api/client';
import { useTranslation } from '../i18n';
import StatusBadge from '../components/StatusBadge';

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'WaitingCarrier', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersListScreen({ navigation }) {
  const { t } = useTranslation();
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('All');
  const [query,     setQuery]     = useState('');
  const [isAdmin,   setIsAdmin]   = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('userRole').then((r) => setIsAdmin(r === 'ADMIN'));
  }, []);

  const fetchOrders = useCallback(async (currentFilter, currentQuery) => {
    setLoading(true);
    try {
      let res;
      if (currentQuery && currentQuery.trim().length > 1) {
        res = await searchOrders(currentQuery.trim());
      } else {
        res = await getOrders(currentFilter === 'All' ? null : currentFilter);
      }
      setOrders(res.data || []);
    } catch {
      Alert.alert(t('error'), t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders(filter, query);
    }, [filter, query])
  );

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchOrders(filter, text), 350);
  };

  const handleFilter = (f) => {
    setFilter(f);
    setQuery('');
    fetchOrders(f, '');
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>#{item.orderId || item.id.slice(0, 8)}</Text>
        <StatusBadge status={item.orderStatus} />
      </View>
      <Text style={styles.route}>
        {item.shippingFrom?.city ?? '—'} → {item.shippingTo?.city ?? '—'}
      </Text>
      <View style={styles.cardBottom}>
        <Text style={styles.meta}>
          👤 {item.customer?.firstName} {item.customer?.lastName}
        </Text>
        <Text style={styles.meta}>{item.orderDate ?? ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 {t('orders')}</Text>
        <Text style={styles.count}>{orders.length}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status filter chips */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f === 'All' ? t('all') : t(`status.${f}`)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchOrders(filter, query)}
              tintColor="#1a73e8"
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noOrders')}</Text>
          }
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F5F7FA' },
  header:        { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title:         { fontSize: 20, fontWeight: '800', color: '#fff' },
  count:         { fontSize: 26, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  searchBar:     { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  searchIcon:    { fontSize: 16, marginRight: 8 },
  searchInput:   { flex: 1, fontSize: 14, color: '#333' },
  clearBtn:      { color: '#aaa', fontSize: 14, paddingLeft: 8 },
  filterBar:     { paddingHorizontal: 12, paddingVertical: 4, maxHeight: 46 },
  chip:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E8EDF5', marginRight: 8 },
  chipActive:    { backgroundColor: '#1a73e8' },
  chipText:      { fontSize: 12, color: '#555', fontWeight: '600' },
  chipTextActive:{ color: '#fff' },
  list:          { padding: 12, paddingBottom: 32 },
  card:          { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:       { fontSize: 14, fontWeight: '800', color: '#222' },
  route:         { fontSize: 13, color: '#1a73e8', fontWeight: '600', marginBottom: 6 },
  cardBottom:    { flexDirection: 'row', justifyContent: 'space-between' },
  meta:          { fontSize: 12, color: '#777' },
  empty:         { textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 15 },
  fab:           { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#1a73e8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  fabText:       { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30 },
});
