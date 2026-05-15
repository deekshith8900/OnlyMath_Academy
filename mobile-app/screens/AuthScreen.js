import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../utils/supabase';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Error', error.message);
      else navigation.goBack();
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        if (data.user) {
          try {
             await supabase.from('user_profiles').insert([{ 
                id: data.user.id, 
                email: email,
                full_name: fullName
             }]);
          } catch (e) {
             console.log(e);
          }
        }
        Alert.alert('Success', 'Check your email for the confirmation link!');
        setIsLoginMode(true);
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>{isLoginMode ? 'Welcome Back' : 'Join OnlyMath'}</Text>
      <Text style={styles.subtitle}>
        {isLoginMode ? 'Sign in to access your courses.' : 'Create an account to start learning.'}
      </Text>

      <View style={styles.form}>
        {!isLoginMode && (
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            placeholderTextColor="#94a3b8"
            value={fullName}
            onChangeText={setFullName}
          />
        )}
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.btn} onPress={handleAuth} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
          <Text style={styles.switchText}>
            {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a16',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#e2e8f0',
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#38bdf8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: '#38bdf8',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  cancelText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  }
});
