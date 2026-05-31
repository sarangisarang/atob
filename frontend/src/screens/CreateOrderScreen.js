import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, FlatList, Modal,
} from 'react-native';
import { getCustomers, getProducts, getLocations, createOrder } from '../api/client';
import { useTranslation } from '../i18n';

const STEPS = ['stepCustomer', 'stepProduct', 'stepRoute', 'stepConfirm'];

function StepBar({ current }) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepBar}>
      {STEPS.map((s, i) => (
        <View key={s} style={styles.stepItem}>
          <View style={[styles.stepDot, i <= current && styles.stepDotActive]}>
            <Text style={[styles.stepNum, i <= current && styles.stepNumActive]}>
              {i + 1}
            </Text>
          </View>
          <Text style={[styles.stepLabel, i === current && styles.stepLabelActive]}>
            {t(s)}
          </Text>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, i < current && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );
}

function SelectModal({ visible, title, items, renderItem, onClose }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const filtered = items.filter((item) =>
    renderItem(item, true).toLowerCase().includes(query.toLowerCase())
  );
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.modalSearch}
          placeholder={t('search')}
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => onClose(item)}>
              <Text style={styles.modalItemText}>{renderItem(item)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t('noResults')}</Text>}
        />
      </View>
    </Modal>
  );
}

export default function CreateOrderScreen({ navigation }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const [customers,  setCustomers]  = useState([]);
  const [products,   setProducts]   = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customer,     setCustomer]     = useState(null);
  const [product,      setProduct]      = useState(null);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation,   setToLocation]   = useState(null);
  const [shippingDate, setShippingDate] = useState('');
  const [orderNo,      setOrderNo]      = useState('');

  const [showModal, setShowModal] = useState(null); // 'customer'|'product'|'from'|'to'

  useEffect(() => {
    Promise.all([getCustomers(), getProducts(), getLocations()])
      .then(([c, p, l]) => {
        setCustomers(c.data || []);
        setProducts(p.data || []);
        setLocations(l.data || []);
      })
      .catch(() => Alert.alert(t('error'), t('loadError')))
      .finally(() => setLoading(false));
  }, []);

  const canNext = () => {
    if (step === 0) return !!customer;
    if (step === 1) return !!product;
    if (step === 2) return !!fromLocation && !!toLocation && fromLocation.id !== toLocation.id;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        orderNo:      orderNo ? parseInt(orderNo, 10) : null,
        shippingDate: shippingDate || null,
        shippingFrom: { id: fromLocation.id },
        shippingTo:   { id: toLocation.id },
        product:      { id: product.id },
      };
      await createOrder(customer.id, payload);
      Alert.alert('✓', t('orderCreated'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data || t('orderCreateError');
      Alert.alert(t('error'), msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createOrder')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <StepBar current={step} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Step 0: Customer */}
        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('selectCustomer')}</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowModal('customer')}
            >
              <Text style={customer ? styles.selectBtnValue : styles.selectBtnPlaceholder}>
                {customer
                  ? `${customer.firstName} ${customer.lastName} — ${customer.email}`
                  : t('selectCustomer')}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            {customer && (
              <View style={styles.card}>
                <InfoRow label={t('email')} value={customer.email} />
                <InfoRow label={t('city')}  value={customer.city} />
                <InfoRow label={t('phone')} value={customer.phone} />
              </View>
            )}
          </View>
        )}

        {/* Step 1: Product */}
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('selectProduct')}</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowModal('product')}
            >
              <Text style={product ? styles.selectBtnValue : styles.selectBtnPlaceholder}>
                {product ? product.productName : t('selectProduct')}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            {product && (
              <View style={styles.card}>
                <InfoRow label={t('description')} value={product.productDesc} />
                <InfoRow
                  label={t('stockAvailable')}
                  value={product.stock?.toString() ?? '—'}
                  valueColor={Number(product.stock) > 0 ? '#2E7D32' : '#C62828'}
                />
              </View>
            )}
          </View>
        )}

        {/* Step 2: Route */}
        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('selectFrom')}</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowModal('from')}
            >
              <Text style={fromLocation ? styles.selectBtnValue : styles.selectBtnPlaceholder}>
                {fromLocation
                  ? `${fromLocation.address ?? fromLocation.Address}, ${fromLocation.city ?? fromLocation.City}`
                  : t('selectFrom')}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('selectTo')}</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowModal('to')}
            >
              <Text style={toLocation ? styles.selectBtnValue : styles.selectBtnPlaceholder}>
                {toLocation
                  ? `${toLocation.address ?? toLocation.Address}, ${toLocation.city ?? toLocation.City}`
                  : t('selectTo')}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            {fromLocation && toLocation && fromLocation.id === toLocation.id && (
              <Text style={styles.errorText}>{t('sameLocationError')}</Text>
            )}
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('stepConfirm')}</Text>
            <View style={styles.card}>
              <InfoRow label={t('stepCustomer')} value={`${customer.firstName} ${customer.lastName}`} />
              <InfoRow label={t('stepProduct')}  value={product.productName} />
              <InfoRow label={t('from')}         value={fromLocation.city ?? fromLocation.City} />
              <InfoRow label={t('to')}           value={toLocation.city ?? toLocation.City} />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('shippingDateLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={shippingDate}
              onChangeText={setShippingDate}
              keyboardType="numeric"
            />

            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Order No (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              value={orderNo}
              onChangeText={setOrderNo}
              keyboardType="numeric"
            />
          </View>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← {t('back')}</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.disabled]}
            onPress={() => canNext() && setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>{t('next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.disabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>{t('createOrderBtn')}</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <SelectModal
        visible={showModal === 'customer'}
        title={t('selectCustomer')}
        items={customers}
        renderItem={(c, labelOnly) =>
          labelOnly ? `${c.firstName} ${c.lastName} ${c.email}` : `${c.firstName} ${c.lastName}\n${c.email}`
        }
        onClose={(selected) => { if (selected) setCustomer(selected); setShowModal(null); }}
      />
      <SelectModal
        visible={showModal === 'product'}
        title={t('selectProduct')}
        items={products}
        renderItem={(p, labelOnly) =>
          labelOnly ? `${p.productName} ${p.productDesc}` : `${p.productName}  (${t('stock')}: ${p.stock ?? 0})`
        }
        onClose={(selected) => { if (selected) setProduct(selected); setShowModal(null); }}
      />
      <SelectModal
        visible={showModal === 'from'}
        title={t('selectFrom')}
        items={locations}
        renderItem={(l) => `${l.address ?? l.Address}, ${l.city ?? l.City}`}
        onClose={(selected) => { if (selected) setFromLocation(selected); setShowModal(null); }}
      />
      <SelectModal
        visible={showModal === 'to'}
        title={t('selectTo')}
        items={locations}
        renderItem={(l) => `${l.address ?? l.Address}, ${l.city ?? l.City}`}
        onClose={(selected) => { if (selected) setToLocation(selected); setShowModal(null); }}
      />
    </View>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F5F7FA' },
  centered:             { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:               { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBack:           { color: '#fff', fontSize: 14 },
  headerTitle:          { color: '#fff', fontSize: 17, fontWeight: '700' },
  stepBar:              { flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8EDF5' },
  stepItem:             { alignItems: 'center', flex: 1, flexDirection: 'column', position: 'relative' },
  stepDot:              { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotActive:        { backgroundColor: '#1a73e8' },
  stepNum:              { fontSize: 12, fontWeight: '700', color: '#999' },
  stepNumActive:        { color: '#fff' },
  stepLabel:            { fontSize: 10, color: '#aaa', textAlign: 'center' },
  stepLabelActive:      { color: '#1a73e8', fontWeight: '700' },
  stepLine:             { position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, backgroundColor: '#E0E0E0' },
  stepLineActive:       { backgroundColor: '#1a73e8' },
  content:              { padding: 16, paddingBottom: 32 },
  section:              { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  sectionTitle:         { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 10 },
  selectBtn:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 10, padding: 14, borderWidth: 1.5, borderColor: '#E0E0E0' },
  selectBtnValue:       { fontSize: 14, color: '#222', fontWeight: '500', flex: 1 },
  selectBtnPlaceholder: { fontSize: 14, color: '#aaa', flex: 1 },
  chevron:              { fontSize: 20, color: '#aaa' },
  card:                 { marginTop: 12, backgroundColor: '#F9FBFF', borderRadius: 10, padding: 12 },
  infoRow:              { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel:            { fontSize: 13, color: '#888' },
  infoValue:            { fontSize: 13, color: '#333', fontWeight: '600' },
  input:                { backgroundColor: '#F5F7FA', borderRadius: 10, padding: 13, fontSize: 14, borderWidth: 1.5, borderColor: '#E0E0E0', marginTop: 4 },
  footer:               { flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E8EDF5' },
  backBtn:              { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center', backgroundColor: '#F0F0F0' },
  backBtnText:          { color: '#555', fontWeight: '600' },
  nextBtn:              { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center', backgroundColor: '#1a73e8' },
  submitBtn:            { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center', backgroundColor: '#2E7D32' },
  nextBtnText:          { color: '#fff', fontWeight: '700', fontSize: 15 },
  disabled:             { opacity: 0.45 },
  errorText:            { color: '#C62828', fontSize: 12, marginTop: 6 },
  modal:                { flex: 1, backgroundColor: '#F5F7FA' },
  modalHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 52, backgroundColor: '#1a73e8' },
  modalTitle:           { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalClose:           { color: '#fff', fontSize: 22, fontWeight: '700' },
  modalSearch:          { margin: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  modalItem:            { backgroundColor: '#fff', padding: 16, marginHorizontal: 12, marginBottom: 6, borderRadius: 10, elevation: 1 },
  modalItemText:        { fontSize: 14, color: '#333' },
  empty:                { textAlign: 'center', color: '#aaa', marginTop: 40 },
});
