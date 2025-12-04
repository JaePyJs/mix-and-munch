import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';

const BRAND_COLORS = {
  lime: '#A3E635',
  darkBg: '#1a1a2e',
  darkSurface: '#16213e',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
};

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.logo}>🍲</Text>
        <Text style={styles.title}>Mix & Munch</Text>
        <Text style={styles.tagline}>Your Filipino Recipe Companion</Text>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.paragraph}>
          Mix & Munch is a recipe discovery app designed to help you cook delicious
          Filipino dishes with whatever ingredients you have in your pantry.
        </Text>
        <Text style={styles.paragraph}>
          Whether you're a seasoned cook or just starting your culinary journey, our app
          helps you explore the rich flavors of Filipino cuisine.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🥘</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Pantry Matching</Text>
            <Text style={styles.featureDesc}>
              Select ingredients you have and find recipes you can make
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🤖</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>AI Chef Assistant</Text>
            <Text style={styles.featureDesc}>
              Ask our AI about Filipino cooking techniques and recipes
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>👥</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Community Recipes</Text>
            <Text style={styles.featureDesc}>
              Share and discover recipes from fellow food lovers
            </Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📱</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Offline Support</Text>
            <Text style={styles.featureDesc}>
              Browse recipes even without internet connection
            </Text>
          </View>
        </View>
      </View>

      {/* Tech Stack */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Built With</Text>
        <View style={styles.techGrid}>
          <View style={styles.techItem}>
            <Text style={styles.techName}>React Native</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techName}>Expo</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techName}>Next.js</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techName}>Supabase</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techName}>Google Gemini</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techName}>TypeScript</Text>
          </View>
        </View>
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credits</Text>
        <Text style={styles.paragraph}>
          Recipe data sourced from various Filipino cooking websites including Panlasang
          Pinoy.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://github.com/JaePyJs/mix-and-munch')}
        >
          <Text style={styles.link}>View on GitHub →</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Mix & Munch</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkBg,
  },
  hero: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLORS.lime,
  },
  tagline: {
    color: BRAND_COLORS.textMuted,
    marginTop: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.darkSurface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 12,
  },
  paragraph: {
    color: BRAND_COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: BRAND_COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    color: BRAND_COLORS.textMuted,
    fontSize: 13,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techItem: {
    backgroundColor: BRAND_COLORS.darkSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  techName: {
    color: BRAND_COLORS.lime,
    fontSize: 12,
  },
  link: {
    color: BRAND_COLORS.lime,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
  },
  copyright: {
    color: BRAND_COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
