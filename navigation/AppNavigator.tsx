import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AquariScreen } from '../screens/AquariScreen';
import { AquariumDetailScreen } from '../screens/AquariumDetailScreen';
import { WaterAnalysisScreen } from '../screens/WaterAnalysisScreen';
import { InhabitantsScreen } from '../screens/InhabitantsScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { colors, spacing } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DetailTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom, height: 60 + insets.bottom }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Dettagli"
        component={AquariumDetailScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Dettagli" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Analisi"
        component={WaterAnalysisScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💧" label="Analisi" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Abitanti"
        component={InhabitantsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🐟" label="Abitanti" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Appunti"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📝" label="Appunti" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="List" component={AquariScreen} />
        <Stack.Screen name="Detail" component={DetailTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
  },
  tabBarItem: {
    paddingTop: spacing.sm,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
