import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, deleteProduct } from '../api/client';
import { useTranslation } from '../i18n';

const BASE_URL = 'http://localhost:8080';

export default function ProductsScreen({ navigation }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch {
      Alert.alert(t('error'), t('loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProducts(); }, [fetchProducts]));

  const handleDelete = (id, name) => {
    Alert.alert(t('confirmDelete'), name, [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'), style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            await fetchProducts();
          } catch {
            Alert.alert(t('error'), t('actionError'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
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
        <Text style={styles.stock}>{t('stock')}: {item.stock ?? 0}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product: item })}
          >
            <Text style={styles.editBtnText}>✏ {t('editProduct')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.productName)}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 {t('products')}</Text>
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
          ListEmptyComponent={<Text style={styles.empty}>{t('noProducts')}</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', { product: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F7FA' },
  header:           { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#fff' },
  list:             { padding: 14, paddingBottom: 100 },
  card:             { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 },
  productImage:     { width: '100%', height: 160 },
  imagePlaceholder: { width: '100%', height: 100, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  placeholderIcon:  { fontSize: 40 },
  cardBody:         { padding: 14 },
  productName:      { fontSize: 16, fontWeight: '800', color: '#222' },
  productDesc:      { fontSize: 13, color: '#666', marginTop: 3, marginBottom: 6 },
  stock:            { fontSize: 12, color: '#1a73e8', fontWeight: '600', marginBottom: 10 },
  btnRow:           { flexDirection: 'row', gap: 8 },
  editBtn:          { flex: 1, backgroundColor: '#E8F0FE', borderRadius: 10, padding: 10, alignItems: 'center' },
  editBtnText:      { color: '#1a73e8', fontWeight: '700', fontSize: 13 },
  deleteBtn:        { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 10, paddingHorizontal: 16, alignItems: 'center' },
  deleteBtnText:    { color: '#C62828', fontWeight: '800', fontSize: 16 },
  empty:            { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  fab:              { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#1a73e8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  fabText:          { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30 },
});
