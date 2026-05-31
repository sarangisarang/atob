import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getChatContacts } from '../api/client';
import { useTranslation } from '../i18n';

export default function ChatContactsScreen({ navigation }) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getChatContacts();
      setContacts(res.data);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchContacts);

  const renderItem = ({ item }) => {
    const name = item.otherParticipantName || `${item.firstName || ''} ${item.lastName || ''}`.trim();
    const role = item.otherParticipantRole || item.role || '';
    const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    return (
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => navigation.navigate('ChatThread', {
          conversationId: item.id,
          contactName: name,
          contactRole: role,
        })}
        activeOpacity={0.75}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.contactRole}>{role === 'DRIVER' ? '🚚 Driver' : '🛍️ Customer'}</Text>
          {item.lastMessage ? <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text> : null}
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.unreadCount}</Text></View>
        )}
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 {t('messages')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#1a73e8" size="large" />
      ) : contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>{t('noContacts')}</Text>
          <Text style={styles.emptyHint}>{t('noContactsHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F7FA' },
  header:       { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#fff' },
  loader:       { marginTop: 60 },
  list:         { padding: 14 },
  contactCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  avatar:       { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  contactInfo:  { flex: 1 },
  contactName:  { fontSize: 16, fontWeight: '700', color: '#222' },
  contactRole:  { fontSize: 13, color: '#888', marginTop: 2 },
  lastMsg:      { fontSize: 12, color: '#aaa', marginTop: 2 },
  badge:        { backgroundColor: '#e53935', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginRight: 6 },
  badgeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  arrow:        { fontSize: 24, color: '#bbb', fontWeight: '300' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:    { fontSize: 56, marginBottom: 16 },
  emptyText:    { fontSize: 18, fontWeight: '700', color: '#444', marginBottom: 8, textAlign: 'center' },
  emptyHint:    { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
});
