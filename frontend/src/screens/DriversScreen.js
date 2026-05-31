import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDrivers } from '../api/client';
import { useTranslation } from '../i18n';

function DriverCard({ driver }) {
  const { t } = useTranslation();
  const initials = `${driver.firstName?.[0] ?? '?'}${driver.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{driver.firstName} {driver.lastName}</Text>
        {driver.email ? (
          <Text style={styles.detail}>✉  {driver.email}</Text>
        ) : null}
        {driver.phone ? (
          <Text style={styles.detail}>📞 {driver.phone}</Text>
        ) : null}
        <Text style={styles.detail}>
          📍 {[driver.address, driver.city, driver.postcode].filter(Boolean).join(', ') || '—'}
        </Text>
      </View>
    </View>
  );
}

export default function DriversScreen() {
  const { t } = useTranslation();
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getDrivers();
      setDrivers(res.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDrivers(); }, [fetchDrivers]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 {t('driversTitle')}</Text>
        <Text style={styles.count}>{drivers.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('error')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDrivers}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => <DriverCard driver={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDrivers} tintColor="#1a73e8" />}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noDrivers')}</Text>
          }
        />
      )}
    </View>
  );
}

const AVATAR_COLORS = ['#1a73e8', '#0288D1', '#7B1FA2', '#2E7D32', '#E65100', '#C62828'];

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F7FA' },
  header:      { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  count:       { fontSize: 28, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  list:        { padding: 14, paddingBottom: 32 },
  card:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  avatar:      { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText:  { color: '#fff', fontWeight: '800', fontSize: 18 },
  info:        { flex: 1 },
  name:        { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  detail:      { fontSize: 12, color: '#666', marginTop: 2 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:   { color: '#C62828', fontSize: 15, marginBottom: 12 },
  retryBtn:    { backgroundColor: '#1a73e8', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:   { color: '#fff', fontWeight: '700' },
  empty:       { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
