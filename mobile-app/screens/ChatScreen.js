import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const [messages, setMessages] = useState([{ text: "Hello! I'm the OnlyMath AI Assistant. How can I help you today?", isBot: true }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'Hindi'];

  useEffect(() => {
    loadOfflineMessages();
  }, []);

  const loadOfflineMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem('@onlymath_chat');
      if (stored) setMessages(JSON.parse(stored));
    } catch (e) { console.warn('Offline load error', e); }
  };

  const saveOfflineMessages = async (msgs) => {
    try {
      await AsyncStorage.setItem('@onlymath_chat', JSON.stringify(msgs));
    } catch (e) { console.warn('Offline save error', e); }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { text: userMsg, isBot: false }];
    setMessages(newMessages);
    saveOfflineMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, session_id: 'mobile-app', language })
      });
      const data = await response.json();
      const finalMsgs = [...newMessages, { text: data.answer, isBot: true }];
      setMessages(finalMsgs);
      saveOfflineMessages(finalMsgs);
    } catch (error) {
      console.error(error);
      const errorMsgs = [...newMessages, { text: "⚠️ (Offline Mode)\nI couldn't reach the server. Your chat history is saved locally. Please connect to the internet to ask new questions.", isBot: true }];
      setMessages(errorMsgs);
      saveOfflineMessages(errorMsgs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={styles.headerText}>OnlyMath AI Tutor</Text>
      </View>
      <View style={styles.langRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10, paddingHorizontal: 20}}>
          {languages.map(lang => (
            <TouchableOpacity key={lang} onPress={() => setLanguage(lang)} style={[styles.langBtn, language === lang && styles.langBtnActive]}>
              <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.chatArea}>
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
            <Text style={[styles.messageText, msg.isBot ? styles.botText : styles.userText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && <Text style={styles.typingText}>AI is typing...</Text>}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Ask a question..." 
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a16' },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerText: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  langRow: { borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 10 },
  langBtn: { paddingVertical: 5, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#94a3b8' },
  langBtnActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  langBtnText: { color: '#94a3b8', fontSize: 12 },
  langBtnTextActive: { color: '#0a0a16', fontWeight: 'bold' },
  chatArea: { padding: 20, gap: 15 },
  messageBubble: { padding: 15, borderRadius: 15, maxWidth: '80%' },
  botBubble: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#38bdf8', alignSelf: 'flex-end' },
  messageText: { fontSize: 16 },
  botText: { color: '#e2e8f0' },
  userText: { color: '#0a0a16', fontWeight: '500' },
  typingText: { color: '#94a3b8', fontStyle: 'italic', marginLeft: 10 },
  inputArea: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0', padding: 15, borderRadius: 25, marginRight: 10 },
  sendBtn: { backgroundColor: '#f59e0b', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 25 },
  sendBtnText: { color: '#fff', fontWeight: 'bold' }
});
