import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from '../i18n';

// Simple approach A: open external search page for webcams near the chosen location.
export default function Webcams({ location }) {
  const { t } = useTranslation();
  if (!location) return null;

  const nameOrCoords = () => {
    if (location.name) return location.name;
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return `${location.latitude},${location.longitude}`;
    }
    return '';
  };

  const openGoogleSearch = async () => {
    const q = encodeURIComponent(`webcams near ${nameOrCoords()}`);
    const url = `https://www.google.com/search?q=${q}`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Could not open URL', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('webcamsTitle')}</Text>
      <Text style={styles.subtitle}>{t('webcamsSubtitle')}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={openGoogleSearch}>
          <Text style={styles.buttonText}>{t('webcamsButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
