import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TrashScreen } from '../screens/TrashScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BikeRentalScreen } from '../screens/BikeRentalScreen';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeScreenBase" component={HomeScreen} />
      <HomeStack.Screen
        name="BikeRental"
        component={BikeRentalScreen}
      />
    </HomeStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a9e6e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Harita',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trash"
        component={TrashScreen}
        options={{
          tabBarLabel: 'Çöp At',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trash-can" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isLoggedIn, setSession } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsLoading(false);
    };

    checkSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a9e6e" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={isLoggedIn ? 'Main' : 'Login'}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
