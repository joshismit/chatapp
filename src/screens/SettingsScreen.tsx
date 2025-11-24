import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../hooks/useSettings';
import { FontSize } from '../services/settings';
import { t } from '../i18n';
import { setLocale, getLocale } from '../i18n';

/**
 * Example Settings Screen showing font size and locale toggles
 */
export default function SettingsScreen() {
  const { settings, loading, fontSizeMultiplier, updateFontSize, updateLocale } = useSettings();

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  const fontSizeOptions: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extraLarge' },
  ];

  const localeOptions: { label: string; value: 'en' | 'es' }[] = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size</Text>
        <Text style={styles.sectionDescription}>
          Adjust text size for better readability
        </Text>
        <View style={styles.optionsContainer}>
          {fontSizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                settings.fontSize === option.value && styles.optionSelected,
              ]}
              onPress={() => updateFontSize(option.value)}
              accessibilityRole="button"
              accessibilityLabel={`Set font size to ${option.label}`}
              accessibilityState={{ selected: settings.fontSize === option.value }}
            >
              <Text
                style={[
                  styles.optionText,
                  { fontSize: 16 * fontSizeMultiplier },
                  settings.fontSize === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {settings.fontSize === option.value && (
                <Ionicons name="checkmark" size={20} color="#25D366" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <Text style={styles.sectionDescription}>
          Choose your preferred language
        </Text>
        <View style={styles.optionsContainer}>
          {localeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                settings.locale === option.value && styles.optionSelected,
              ]}
              onPress={() => updateLocale(option.value)}
              accessibilityRole="button"
              accessibilityLabel={`Set language to ${option.label}`}
              accessibilityState={{ selected: settings.locale === option.value }}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.locale === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {settings.locale === option.value && (
                <Ionicons name="checkmark" size={20} color="#25D366" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <Text style={styles.sectionDescription}>
          Sample text with current font size
        </Text>
        <View style={styles.previewContainer}>
          <Text style={[styles.previewText, { fontSize: 14 * fontSizeMultiplier }]}>
            This is a sample message to preview the font size setting.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#667781',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#25D366',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#25D366',
  },
  previewContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginTop: 8,
  },
  previewText: {
    color: '#000',
    lineHeight: 20,
  },
});

