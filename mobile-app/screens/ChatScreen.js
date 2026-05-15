import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState([{ text: "Hello! I'm the OnlyMath AI Assistant. How can I help you today?", isBot: true }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      // Connect to the Python API. Since this runs on an emulator/device, use local IP or Vercel URL
      // For local testing on Android emulator, use 10.0.2.2:8000. On iOS simulator, localhost:8000
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, session_id: 'mobile-app' })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.answer, isBot: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting to the server.", isBot: true }]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={styles.headerText}>OnlyMath AI Tutor</Text>
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
