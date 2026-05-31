import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { createCustomerOrder } from '../api/client';
import { useTranslation } from '../i18n';

const TRANSPORT_TYPES = ['LIGHT', 'TRUCK', 'TRAILER'];
const CARGO_TYPES = ['GENERAL_GOODS', 'VEHICLE', 'CONSTRUCTION_MATERIAL', 'EQUIPMENT', 'OTHER'];

// Module-level (stable identity) — declaring inside the screen would remount the
// TextInput each keystroke and collapse the keyboard.
function Field({ label, value, onChangeText, keyboardType = 'default', placeholder, multiline = false }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder || label}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCorrect={false}
        blurOnSubmit={false}
        multiline={multiline}
      />
    </View>
  );
}

function Chips({ options, value, onSelect, labelFn }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{labelFn(opt)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CustomerOrderFormScreen({ route, navigation }) {
  const { t } = useTranslation();
  const product = route.params?.product;

  const [f, setF] = useState({
    pickupAddress: '', pickupCity: '', pickupPostcode: '', pickupPhone: '',
    deliveryAddress: '', deliveryCity: '', deliveryPostcode: '', deliveryPhone: '',
    transportType: 'TRUCK',
    cargoType: 'GENERAL_GOODS',
    cargoName: product?.productName || '',
    cargoDescription: product?.productDesc || '',
    weightKg: '', quantity: '1',
    shippingDate: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const transportLabel = (x) => ({ LIGHT: t('tt_light'), TRUCK: t('tt_truck'), TRAILER: t('tt_trailer') }[x] || x);
  const cargoLabel = (x) => ({
    GENERAL_GOODS: t('ct_general'), VEHICLE: t('ct_vehicle'),
    CONSTRUCTION_MATERIAL: t('ct_construction'), EQUIPMENT: t('ct_equipment'), OTHER: t('ct_other'),
  }[x] || x);

  const submit = async () => {
    if (!f.pickupCity.trim() || !f.deliveryCity.trim()) {
      Alert.alert(t('error'), t('cityRequired')); return;
    }
    if (!f.cargoName.trim()) { Alert.alert(t('error'), t('cargoRequired')); return; }
    if (f.weightKg && Number(f.weightKg) <= 0) { Alert.alert(t('error'), t('weightInvalid')); return; }
    if (f.quantity && Number(f.quantity) < 1) { Alert.alert(t('error'), t('qtyInvalid')); return; }
    if (f.shippingDate && !/^\d{4}-\d{2}-\d{2}$/.test(f.shippingDate.trim())) {
      Alert.alert(t('error'), t('dateInvalid')); return;
    }

    setSubmitting(true);
    try {
      await createCustomerOrder({
        ...f,
        weightKg: f.weightKg ? Number(f.weightKg) : null,
        quantity: f.quantity ? Number(f.quantity) : 1,
        shippingDate: f.shippingDate.trim() || null,
      });
      Alert.alert('✅', t('orderPlacedMsg'), [
        { text: t('ok'), onPress: () => navigation.navigate('CustomerOrdersTab') },
      ]);
    } catch (err) {
      const msg = err?.response?.data || t('orderCreateError');
      Alert.alert(t('error'), typeof msg === 'string' ? msg : t('orderCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹ {t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📦 {t('createOrder')}</Text>
        </View>

        {/* Pickup */}
        <View style={styles.card}>
          <Text style={styles.section}>📍 {t('pickupSection')}</Text>
          <Field label={t('selectPickup')} value={f.pickupAddress} onChangeText={set('pickupAddress')} />
          <Field label={t('city')} value={f.pickupCity} onChangeText={set('pickupCity')} />
          <View style={styles.row2}>
            <View style={styles.col}><Field label={t('postcode')} value={f.pickupPostcode} onChangeText={set('pickupPostcode')} keyboardType="numeric" /></View>
            <View style={styles.col}><Field label={t('phone')} value={f.pickupPhone} onChangeText={set('pickupPhone')} keyboardType="phone-pad" /></View>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.card}>
          <Text style={styles.section}>🏁 {t('deliverySection')}</Text>
          <Field label={t('selectDelivery')} value={f.deliveryAddress} onChangeText={set('deliveryAddress')} />
          <Field label={t('city')} value={f.deliveryCity} onChangeText={set('deliveryCity')} />
          <View style={styles.row2}>
            <View style={styles.col}><Field label={t('postcode')} value={f.deliveryPostcode} onChangeText={set('deliveryPostcode')} keyboardType="numeric" /></View>
            <View style={styles.col}><Field label={t('phone')} value={f.deliveryPhone} onChangeText={set('deliveryPhone')} keyboardType="phone-pad" /></View>
          </View>
        </View>

        {/* Transport + cargo */}
        <View style={styles.card}>
          <Text style={styles.section}>🚛 {t('shipmentSection')}</Text>
          <Text style={styles.label}>{t('transportTypeLabel')}</Text>
          <Chips options={TRANSPORT_TYPES} value={f.transportType} onSelect={set('transportType')} labelFn={transportLabel} />
          <Text style={[styles.label, { marginTop: 10 }]}>{t('cargoTypeLabel')}</Text>
          <Chips options={CARGO_TYPES} value={f.cargoType} onSelect={set('cargoType')} labelFn={cargoLabel} />
          <Field label={t('cargoNameLabel')} value={f.cargoName} onChangeText={set('cargoName')} />
          <Field label={t('description')} value={f.cargoDescription} onChangeText={set('cargoDescription')} multiline />
          <View style={styles.row2}>
            <View style={styles.col}><Field label={t('weightKgLabel')} value={f.weightKg} onChangeText={set('weightKg')} keyboardType="numeric" /></View>
            <View style={styles.col}><Field label={t('quantityLabel')} value={f.quantity} onChangeText={set('quantity')} keyboardType="numeric" /></View>
          </View>
        </View>

        {/* Schedule + notes */}
        <View style={styles.card}>
          <Text style={styles.section}>🗓 {t('scheduleSection')}</Text>
          <Field label={t('shippingDateLabel')} value={f.shippingDate} onChangeText={set('shippingDate')} placeholder="2026-06-05" />
          <Field label={t('notesLabel')} value={f.notes} onChangeText={set('notes')} multiline />
        </View>

        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('createOrderBtn')}</Text>}
        </TouchableOpacity>
        <View style={{ height: 28 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a73e8' },
  content:     { paddingBottom: 30 },
  header:      { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  back:        { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  card:        { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16, elevation: 3 },
  section:     { fontSize: 14, fontWeight: '800', color: '#1a73e8', marginBottom: 12 },
  fieldWrap:   { marginBottom: 10 },
  label:       { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  input:       { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 15, color: '#333', backgroundColor: '#FAFAFA' },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  row2:        { flexDirection: 'row', marginHorizontal: -5 },
  col:         { flex: 1, marginHorizontal: 5 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  chip:        { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#FAFAFA' },
  chipActive:  { borderColor: '#1a73e8', backgroundColor: '#E8F0FE' },
  chipText:    { fontSize: 13, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#1a73e8', fontWeight: '800' },
  btn:         { backgroundColor: '#0b57d0', borderRadius: 14, padding: 17, alignItems: 'center', marginHorizontal: 16, marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '800' },
});
