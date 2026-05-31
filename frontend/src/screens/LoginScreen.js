import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getMe } from '../api/client';
import { useTranslation, LANGUAGES } from '../i18n';

export default function LoginScreen({ navigation }) {
  const { t, lang, changeLanguage } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fillBoth'));
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      const meRes = await getMe();
      const { role, carrierId, customerId, firstName, lastName } = meRes.data;
      await AsyncStorage.multiSet([
        ['userRole',   role       ?? ''],
        ['carrierId',  carrierId  ?? ''],
        ['customerId', customerId ?? ''],
        ['firstName',  firstName  ?? ''],
        ['lastName',   lastName   ?? ''],
      ]);
      const dest = role === 'DRIVER' ? 'DriverMain'
                 : role === 'CUSTOMER' ? 'CustomerMain'
                 : 'Main';
      navigation.replace(dest);
    } catch (err) {
      const status = err.response?.status;
      Alert.alert(
        t('error'),
        status === 401 ? t('loginError') : t('serverError'),
      );
    } finally {
      setLoading(false);
    }
  };

  const pickLanguage = (code) => {
    changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Language selector */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLangOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.langButtonText}>{currentLang.label}</Text>
            <Text style={styles.langChevron}>▾</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>🚛</Text>
          <Text style={styles.title}>ATOB</Text>
          <Text style={styles.subtitle}>Transport Management</Text>

          <TextInput
            style={styles.input}
            placeholder={t('email')}
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
          />
          <TextInput
            style={styles.input}
            placeholder={t('password')}
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{t('loginBtn')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('RegisterType')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>{t('registerBtn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language menu modal */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('languageSection') || 'Language'}</Text>
            <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
              {LANGUAGES.map((lng) => {
                const active = lng.code === lang;
                return (
                  <TouchableOpacity
                    key={lng.code}
                    style={[styles.langRow, active && styles.langRowActive]}
                    onPress={() => pickLanguage(lng.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.langRowText, active && styles.langRowTextActive]}>
                      {lng.label}
                    </Text>
                    {active && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a73e8' },
  scroll:      { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  card:        { width: '88%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12 },

  langButton:     { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  langButtonText: { fontSize: 13, color: '#1a73e8', fontWeight: '600' },
  langChevron:    { fontSize: 12, color: '#1a73e8', marginLeft: 4 },

  logo:        { fontSize: 52, marginBottom: 4 },
  title:       { fontSize: 28, fontWeight: '800', color: '#1a73e8', letterSpacing: 2 },
  subtitle:    { fontSize: 13, color: '#888', marginBottom: 28, fontWeight: '500' },
  input:       { width: '100%', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12, color: '#333', backgroundColor: '#FAFAFA' },
  btn:          { width: '100%', backgroundColor: '#1a73e8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 6 },
  btnDisabled:  { backgroundColor: '#90B8F8' },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerBtn:  { marginTop: 16, alignItems: 'center' },
  registerText: { color: '#1a73e8', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 18, elevation: 12 },
  modalTitle:   { fontSize: 16, fontWeight: '700', color: '#1a73e8', marginBottom: 12, textAlign: 'center' },
  langRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 5, backgroundColor: '#F5F7FA' },
  langRowActive:{ backgroundColor: '#E8F0FE', borderWidth: 1.5, borderColor: '#1a73e8' },
  langRowText:  { fontSize: 15, color: '#444', fontWeight: '500' },
  langRowTextActive: { color: '#1a73e8', fontWeight: '700' },
  check:        { color: '#1a73e8', fontWeight: '800', fontSize: 16 },
});
