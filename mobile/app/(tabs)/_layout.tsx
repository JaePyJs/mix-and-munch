import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

// Mix & Munch brand colors
const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND_COLORS.lime,
        tabBarInactiveTintColor: BRAND_COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: BRAND_COLORS.darkSurface,
          borderTopColor: BRAND_COLORS.darkBg,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: BRAND_COLORS.darkBg,
        },
        headerTintColor: BRAND_COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarLabelStyle: {
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-basket" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chef',
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <TabBarIcon name="info-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
