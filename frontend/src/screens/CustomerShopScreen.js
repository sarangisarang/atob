import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, BASE_URL } from '../api/client';
import { useTranslation } from '../i18n';

export default function CustomerShopScreen({ navigation }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProducts(); }, [fetchProducts]));

  const renderItem = ({ item }) => {
    const inStock = Number(item.stock) > 0;
    return (
      <TouchableOpacity
        style={[styles.card, !inStock && styles.cardDisabled]}
        onPress={() => inStock && navigation.navigate('CustomerOrderForm', { product: item })}
        activeOpacity={inStock ? 0.75 : 1}
      >
        {item.hasImage ? (
          <Image
            source={{ uri: `${BASE_URL}/products/${item.id}/image` }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.productName}>{item.productName}</Text>
          {item.productDesc ? (
            <Text style={styles.productDesc} numberOfLines={2}>{item.productDesc}</Text>
          ) : null}
          <View style={styles.stockRow}>
            <Text style={[styles.stockBadge, { backgroundColor: inStock ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={{ color: inStock ? '#2E7D32' : '#C62828' }}>
                {inStock ? `✓ ${t('inStock')}: ${item.stock}` : `✗ ${t('outOfStockMsg')}`}
              </Text>
            </Text>
          </View>
          {inStock && (
            <View style={styles.orderBtn}>
              <Text style={styles.orderBtnText}>{t('placeOrder')} →</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍 {t('browseProducts')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noProducts')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F7FA' },
  header:           { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#fff' },
  list:             { padding: 14, paddingBottom: 32 },
  card:             { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 6 },
  cardDisabled:     { opacity: 0.55 },
  productImage:     { width: '100%', height: 180 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#E8EDF5', justifyContent: 'center', alignItems: 'center' },
  placeholderIcon:  { fontSize: 52 },
  cardBody:         { padding: 14 },
  productName:      { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 4 },
  productDesc:      { fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 18 },
  stockRow:         { flexDirection: 'row', marginBottom: 10 },
  stockBadge:       { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, fontSize: 12, fontWeight: '600' },
  orderBtn:         { backgroundColor: '#1a73e8', borderRadius: 10, padding: 11, alignItems: 'center' },
  orderBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty:            { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
