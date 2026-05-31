import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { registerCustomer, registerDriver } from '../api/client';
import { useTranslation } from '../i18n';

// IMPORTANT: defined at module level (stable identity).
// If this were declared inside RegisterFormScreen, it would be re-created on
// every keystroke → TextInput remounts → keyboard collapses after each letter.
function Field({ label, value, onChangeText, keyboardType = 'default', secureTextEntry = false, autoCapitalize = 'words' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        blurOnSubmit={false}
      />
    </View>
  );
}

export default function RegisterFormScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { type } = route.params; // 'customer' or 'driver'
  const isDriver = type === 'driver';

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    address: '', city: '', postcode: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      Alert.alert(t('error'), t('fillBoth'));
      return;
    }
    if (form.password.length < 8) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert(t('error'), t('passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...rest } = form;
      const payload = {
        ...rest,
        postcode: form.postcode || null,
        phone:    form.phone    || null,
      };
      if (isDriver) {
        await registerDriver(payload);
      } else {
        await registerCustomer(payload);
      }
      Alert.alert('✅', t('registrationSuccess'), [
        { text: t('ok'), onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      const msg = err?.response?.data || err?.message || t('registrationError');
      const msgStr = typeof msg === 'string' ? msg : JSON.stringify(msg);
      if (msgStr.toLowerCase().includes('already exists') || err?.response?.status === 400) {
        Alert.alert(t('error'), t('emailTaken') + '\n\n' + msgStr);
      } else {
        Alert.alert(t('error'), t('registrationError') + (msgStr ? '\n' + msgStr : ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>{isDriver ? '🚚' : '🛍️'}</Text>
          <Text style={styles.headerTitle}>{t('registerTitle')}</Text>
          <Text style={styles.headerSub}>{isDriver ? t('registerAsDriver') : t('registerAsCustomer')}</Text>
        </View>

        <View style={styles.card}>
          <Field label={t('firstName')} value={form.firstName} onChangeText={set('firstName')} />
          <Field label={t('lastName')}  value={form.lastName}  onChangeText={set('lastName')} />
          <Field label={t('email')}     value={form.email}     onChangeText={set('email')}    keyboardType="email-address" autoCapitalize="none" />
          <Field label={t('password')}  value={form.password}  onChangeText={set('password')} secureTextEntry autoCapitalize="none" />
          <Field label={t('confirmPassword')} value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry autoCapitalize="none" />
          <Field label={t('address')}   value={form.address}   onChangeText={set('address')} />
          <Field label={t('city')}      value={form.city}      onChangeText={set('city')} />
          <Field label={t('postcode')}  value={form.postcode}  onChangeText={set('postcode')} keyboardType="numeric" />
          <Field label={t('phone')}     value={form.phone}     onChangeText={set('phone')}    keyboardType="phone-pad" />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{t('registerBtn2')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a73e8' },
  content:     { paddingBottom: 40 },
  header:      { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  headerEmoji: { fontSize: 42, marginBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  headerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  card:        { backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 20, padding: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  fieldWrap:   { marginBottom: 12 },
  label:       { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  input:       { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10, padding: 13, fontSize: 15, color: '#333', backgroundColor: '#FAFAFA' },
  btn:         { backgroundColor: '#1a73e8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#90B8F8' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn:     { alignItems: 'center', marginTop: 16 },
  backText:    { color: '#1a73e8', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
