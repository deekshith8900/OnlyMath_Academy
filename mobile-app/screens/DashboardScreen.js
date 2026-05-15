import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setEmail(session.user.email);
        supabase.from('user_profiles').select('full_name').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });
  }, []);

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are not logged in!</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.full_name || 'Student'}</Text>
      <Text style={styles.subtitle}>{email}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Courses</Text>
        <Text style={styles.cardDesc}>You are not enrolled in any premium courses yet.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards</Text>
        <Text style={styles.cardDesc}>0 Bounties Collected. Keep learning!</Text>
      </View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444', marginTop: 30 }]} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.btnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a16', padding: 30, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#38bdf8', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 15, marginBottom: 20, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#e2e8f0', marginBottom: 10 },
  cardDesc: { color: '#94a3b8', fontSize: 16 },
  btn: { backgroundColor: '#38bdf8', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
