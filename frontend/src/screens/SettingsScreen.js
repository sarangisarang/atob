import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { logout } from '../api/client';
import { useTranslation, LANGUAGES } from '../i18n';

function LangOption({ label, langCode, current, onSelect }) {
  const active = current === langCode;
  return (
    <TouchableOpacity
      style={[styles.langOption, active && styles.langOptionActive]}
      onPress={() => onSelect(langCode)}
      activeOpacity={0.7}
    >
      <Text style={[styles.langText, active && styles.langTextActive]}>{label}</Text>
      {active && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { t, lang, changeLanguage } = useTranslation();

  const handleLogout = () => {
    Alert.alert(t('logoutBtn'), t('confirmMsg'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ {t('settingsTitle')}</Text>
      </View>

      <View style={styles.content}>
        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('languageSection')}</Text>
          {LANGUAGES.map((lng) => (
            <LangOption
              key={lng.code}
              label={lng.label}
              langCode={lng.code}
              current={lang}
              onSelect={changeLanguage}
            />
          ))}
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('version')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ATOB Transport System</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t('logoutBtn')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent:     { paddingBottom: 40 },
  header:            { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle:       { fontSize: 20, fontWeight: '800', color: '#fff' },
  content:           { padding: 16 },
  section:           { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  sectionTitle:      { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  langOption:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, marginBottom: 5, backgroundColor: '#F5F7FA' },
  langOptionActive:  { backgroundColor: '#E8F0FE', borderWidth: 1.5, borderColor: '#1a73e8' },
  langText:          { fontSize: 15, color: '#444', fontWeight: '500' },
  langTextActive:    { color: '#1a73e8', fontWeight: '700' },
  checkmark:         { color: '#1a73e8', fontSize: 16, fontWeight: '800' },
  infoRow:           { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel:         { fontSize: 14, color: '#555' },
  logoutBtn:         { backgroundColor: '#C62828', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText:        { color: '#fff', fontSize: 15, fontWeight: '700' },
});
