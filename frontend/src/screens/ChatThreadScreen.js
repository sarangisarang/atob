import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { getChatMessages, sendChatMessage } from '../api/client';
import { useTranslation } from '../i18n';

export default function ChatThreadScreen({ route }) {
  const { t } = useTranslation();
  const { conversationId, contactName } = route.params;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const scrollToEnd = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await getChatMessages(conversationId);
      setMessages(res.data);
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) setTimeout(scrollToEnd, 100);
  }, [messages.length, scrollToEnd]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const trimmed = text.trim();
    setText('');
    try {
      await sendChatMessage(conversationId, trimmed);
      await fetchMessages();
    } catch {}
    setSending(false);
  };

  const renderMsg = ({ item }) => {
    const isOwn = item.mine;
    return (
      <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.msgText, isOwn ? styles.msgTextOwn : styles.msgTextOther]}>
            {item.content}
          </Text>
          <Text style={[styles.msgTime, isOwn ? styles.msgTimeOwn : styles.msgTimeOther]}>
            {item.sentAt ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {contactName?.[0]?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>{contactName}</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color="#1a73e8" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={scrollToEnd}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={t('typeMessage')}
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendIcon}>➤</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F0F4F8' },
  header:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a73e8', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  headerAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerName:       { fontSize: 17, fontWeight: '700', color: '#fff' },
  emptyWrap:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgList:          { padding: 12, paddingBottom: 8 },
  msgRow:           { marginBottom: 8 },
  msgRowOwn:        { alignItems: 'flex-end' },
  msgRowOther:      { alignItems: 'flex-start' },
  bubble:           { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleOwn:        { backgroundColor: '#1a73e8', borderBottomRightRadius: 4 },
  bubbleOther:      { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  msgText:          { fontSize: 15, lineHeight: 20 },
  msgTextOwn:       { color: '#fff' },
  msgTextOther:     { color: '#222' },
  msgTime:          { fontSize: 10, marginTop: 3 },
  msgTimeOwn:       { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  msgTimeOther:     { color: '#aaa' },
  inputBar:         { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  input:            { flex: 1, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333', backgroundColor: '#FAFAFA', maxHeight: 100, marginRight: 10 },
  sendBtn:          { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled:  { backgroundColor: '#B0C8F5' },
  sendIcon:         { color: '#fff', fontSize: 18, marginLeft: 2 },
});
