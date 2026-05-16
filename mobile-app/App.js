import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import ChatScreen from './screens/ChatScreen';
import DashboardScreen from './screens/DashboardScreen';
import ToolsScreen from './screens/ToolsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { backgroundColor: '#0a0a16', borderTopColor: 'rgba(255,255,255,0.1)' },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8'
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AI Tutor" component={ChatScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Profile" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a16' } }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
