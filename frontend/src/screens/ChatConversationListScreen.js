import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getChatConversations } from '../api/client';
import { useTranslation } from '../i18n';

export default function ChatConversationListScreen({ navigation }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getChatConversations();
      setConversations(res.data);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchConversations);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ChatThread', {
        conversationId: item.id,
        contactName: item.otherParticipantName || item.otherParticipantRole,
      })}
      activeOpacity={0.75}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.otherParticipantName?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.otherParticipantName}</Text>
        <Text style={styles.role}>
          {item.otherParticipantRole === 'DRIVER' ? '🚚 Driver' : '🛍️ Customer'}
        </Text>
        {item.lastMessage ? (
          <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
        ) : null}
      </View>
      {item.unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 {t('messages')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#1a73e8" size="large" />
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>{t('noContacts')}</Text>
          <Text style={styles.emptyHint}>{t('noContactsHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F5F7FA' },
  header:      { backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  loader:      { marginTop: 60 },
  list:        { padding: 14 },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  info:        { flex: 1 },
  name:        { fontSize: 16, fontWeight: '700', color: '#222' },
  role:        { fontSize: 13, color: '#888', marginTop: 2 },
  arrow:       { fontSize: 24, color: '#bbb', fontWeight: '300' },
  preview:     { fontSize: 13, color: '#999', marginTop: 3 },
  badge:       { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#e53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:   { fontSize: 56, marginBottom: 16 },
  emptyText:   { fontSize: 18, fontWeight: '700', color: '#444', marginBottom: 8, textAlign: 'center' },
  emptyHint:   { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
});
