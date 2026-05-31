import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n';

export default function RegisterTypeScreen({ navigation }) {
  const { t } = useTranslation();

  const choose = (type) => navigation.navigate('RegisterForm', { type });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚛</Text>
        <Text style={styles.title}>ATOB</Text>
        <Text style={styles.subtitle}>{t('chooseRole')}</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity style={[styles.card, styles.cardCustomer]} onPress={() => choose('customer')} activeOpacity={0.85}>
          <Text style={styles.cardEmoji}>🛍️</Text>
          <Text style={styles.cardTitle}>{t('registerAsCustomer')}</Text>
          <Text style={styles.cardDesc}>შეუკვეთე პროდუქტები</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.cardDriver]} onPress={() => choose('driver')} activeOpacity={0.85}>
          <Text style={styles.cardEmoji}>🚚</Text>
          <Text style={styles.cardTitle}>{t('registerAsDriver')}</Text>
          <Text style={styles.cardDesc}>გადაიტანე შეკვეთები</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>{t('back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#1a73e8' },
  header:         { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logo:           { fontSize: 52, marginBottom: 4 },
  title:          { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  subtitle:       { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontWeight: '500' },
  cards:          { paddingHorizontal: 24, gap: 16 },
  card:           { borderRadius: 20, padding: 28, alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  cardCustomer:   { backgroundColor: '#fff' },
  cardDriver:     { backgroundColor: '#fff' },
  cardEmoji:      { fontSize: 48, marginBottom: 12 },
  cardTitle:      { fontSize: 20, fontWeight: '800', color: '#1a73e8', marginBottom: 4 },
  cardDesc:       { fontSize: 13, color: '#888', fontWeight: '500' },
  backBtn:        { alignItems: 'center', marginTop: 32 },
  backText:       { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
});
