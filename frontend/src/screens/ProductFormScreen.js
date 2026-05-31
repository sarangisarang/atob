import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, updateProduct, uploadProductImage, BASE_URL } from '../api/client';
import { useTranslation } from '../i18n';

export default function ProductFormScreen({ route, navigation }) {
  const { product } = route.params;
  const { t } = useTranslation();
  const isEdit = !!product;

  const [name,       setName]       = useState(product?.productName ?? '');
  const [desc,       setDesc]       = useState(product?.productDesc ?? '');
  const [stock,      setStock]      = useState(product?.stock?.toString() ?? '0');
  const [imageUri,   setImageUri]   = useState(null);   // newly picked local URI
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);

  // Existing image from server (only if product already has one)
  const serverImageUrl = isEdit && product.hasImage
    ? `${BASE_URL}/products/${product.id}/image?t=${Date.now()}`
    : null;

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(t('error'), 'Gallery permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(t('error'), 'Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), `${t('name')} required`);
      return;
    }
    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert(t('error'), `${t('stockLabel')} must be ≥ 0`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        productName: name.trim(),
        productDesc: desc.trim() || null,
        stock:       stockNum,
      };

      let savedProduct;
      if (isEdit) {
        const res = await updateProduct(product.id, payload);
        savedProduct = res.data;
      } else {
        const res = await createProduct(payload);
        savedProduct = res.data;
      }

      // Upload image if one was picked
      if (imageUri) {
        setUploading(true);
        await uploadProductImage(savedProduct.id, imageUri);
        setUploading(false);
      }

      Alert.alert('✓', t('productSaved'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setUploading(false);
      Alert.alert(t('error'), err.response?.data || t('actionError'));
    } finally {
      setSaving(false);
    }
  };

  const previewUri = imageUri ?? serverImageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? t('editProduct') : t('addProduct')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Image preview */}
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
            <Text style={styles.placeholderHint}>{t('imageUrl')}</Text>
          </View>
        )}

        {/* Image picker buttons */}
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text style={styles.imageBtnText}>{t('gallery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
            <Text style={styles.imageBtnText}>{t('camera')}</Text>
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity style={[styles.imageBtn, styles.imageBtnClear]} onPress={() => setImageUri(null)}>
              <Text style={styles.imageBtnText}>{t('cancelImg')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fields */}
        <Field label={`${t('name')} *`}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('name')}
            placeholderTextColor="#bbb"
          />
        </Field>

        <Field label={t('description')}>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={desc}
            onChangeText={setDesc}
            placeholder={t('description')}
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Field label={`${t('stockLabel')} *`}>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="0"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
          />
        </Field>

        <TouchableOpacity
          style={[styles.saveBtn, (saving || uploading) && styles.disabled]}
          onPress={handleSave}
          disabled={saving || uploading}
        >
          {uploading ? (
            <View style={styles.savingRow}>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>{t('imageUploading')}</Text>
            </View>
          ) : saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? t('saveImg') : '+ ' + t('addProduct')}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F7FA' },
  header:           { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBack:       { color: '#fff', fontSize: 14 },
  headerTitle:      { color: '#fff', fontSize: 17, fontWeight: '700' },
  content:          { padding: 16, paddingBottom: 40 },
  imagePreview:     { width: '100%', height: 220, borderRadius: 14, marginBottom: 10 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#EEF2FF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  placeholderIcon:  { fontSize: 44 },
  placeholderHint:  { fontSize: 12, color: '#aaa', marginTop: 6 },
  imageButtons:     { flexDirection: 'row', gap: 8, marginBottom: 18 },
  imageBtn:         { flex: 1, backgroundColor: '#E8F0FE', borderRadius: 10, padding: 11, alignItems: 'center' },
  imageBtnClear:    { backgroundColor: '#FFEBEE' },
  imageBtnText:     { fontSize: 13, fontWeight: '600', color: '#1a73e8' },
  field:            { marginBottom: 14 },
  fieldLabel:       { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  input:            { backgroundColor: '#fff', borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1.5, borderColor: '#E0E0E0', color: '#222' },
  inputMulti:       { minHeight: 110, lineHeight: 20 },
  saveBtn:          { backgroundColor: '#2E7D32', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  savingRow:        { flexDirection: 'row', alignItems: 'center' },
  disabled:         { opacity: 0.5 },
});
