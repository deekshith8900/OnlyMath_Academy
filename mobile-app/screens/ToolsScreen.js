import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ToolsScreen() {
  const [currentUrl, setCurrentUrl] = useState(null);

  // Since local URLs (127.0.0.1) don't work cleanly on physical devices or Android emulators,
  // we point to the Vercel hosted version (assuming it is deployed).
  const BASE_URL = 'https://onlymath-academy.vercel.app';

  if (currentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentUrl(null)}>
          <Text style={styles.backText}>← Back to Tools</Text>
        </TouchableOpacity>
        <WebView 
          source={{ uri: currentUrl }} 
          style={{ flex: 1, backgroundColor: '#0a0a16' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Math Tools</Text>
        <Text style={styles.subtitle}>Select a tool to open it in the mobile viewer.</Text>

        <TouchableOpacity style={[styles.toolCard, { borderColor: '#f43f5e' }]} onPress={() => setCurrentUrl(`${BASE_URL}/graph.html`)}>
          <Text style={[styles.toolIcon, { color: '#f43f5e' }]}>📈</Text>
          <Text style={styles.toolTitle}>Graphing Plotter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toolCard, { borderColor: '#10b981' }]} onPress={() => setCurrentUrl(`${BASE_URL}/formulas.html`)}>
          <Text style={[styles.toolIcon, { color: '#10b981' }]}>📚</Text>
          <Text style={styles.toolTitle}>Formula Cheat Sheet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toolCard, { borderColor: '#c084fc' }]} onPress={() => setCurrentUrl(`${BASE_URL}/whiteboard.html`)}>
          <Text style={[styles.toolIcon, { color: '#c084fc' }]}>🎨</Text>
          <Text style={styles.toolTitle}>Interactive Whiteboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toolCard, { borderColor: '#ef4444' }]} onPress={() => setCurrentUrl(`${BASE_URL}/timer.html`)}>
          <Text style={[styles.toolIcon, { color: '#ef4444' }]}>⏱️</Text>
          <Text style={styles.toolTitle}>Focus Timer</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a16',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 10,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 40,
  },
  toolCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  toolTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
