import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';

const COURSES = [
  { age: '2-5', title: 'Shapes & Colors', desc: 'Early childhood counting, basic shapes, and color recognition for toddlers.' },
  { age: '5-10', title: 'Addition Adventures', desc: 'Fun, gamified introduction to arithmetic, multiplication tables, and fractions.' },
  { age: '10-15', title: 'Foundational Geometry', desc: 'Understand shapes, sizes, relative position of figures, and properties of space.' },
  { age: '10-15', title: 'Advanced Algebra', desc: 'Master variables, inequalities, functions, and complex algebraic structures.' },
  { age: '15+', title: 'Calculus & Analysis', desc: 'Dive deep into limits, derivatives, integrals, and infinite series.' },
  { age: '15+', title: 'Real World Statistics', desc: 'Probability distributions, data analysis, and predictive modeling basics.' },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredCourses = activeFilter === 'all' ? COURSES : COURSES.filter(c => c.age === activeFilter);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      navigation.navigate('Auth');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>Σ OnlyMath</Text>
        <TouchableOpacity style={styles.authBtn} onPress={handleAuthAction}>
          <Text style={styles.authBtnText}>{user ? 'Log Out' : 'Log In / Sign Up'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Master Mathematics,</Text>
        <Text style={styles.gradientText}>Unlock the Universe.</Text>
        <Text style={styles.subtitle}>
          Join the premier academy dedicated entirely to mathematical excellence. From fundamentals to advanced calculus.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
        {['all', '2-5', '5-10', '10-15', '15+'].map(filter => (
          <TouchableOpacity 
            key={filter} 
            style={[styles.tab, activeFilter === filter && styles.tabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.tabText, activeFilter === filter && styles.tabTextActive]}>
              {filter === 'all' ? 'All Ages' : `Ages ${filter}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.cardContainer}>
        {filteredCourses.map((course, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitle}>{course.title}</Text>
            <Text style={styles.cardDesc}>{course.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a16',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  authBtn: {
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  authBtnText: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  hero: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  gradientText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
  },
  cardContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 10,
  },
  cardDesc: {
    color: '#94a3b8',
    lineHeight: 22,
  },
  filterTabs: {
    paddingBottom: 20,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#38bdf8',
  },
  tabText: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#0a0a16',
  }
});
