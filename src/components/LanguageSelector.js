import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTranslation } from '../i18n';

export default function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <TouchableOpacity
          style={[styles.button, lang === 'sv' ? styles.active : styles.inactive]}
          onPress={() => setLang('sv')}
        >
          <View style={styles.flagBadgeContainer}>
            <Svg width={22} height={14} viewBox="0 0 22 14">
              <Rect x="0" y="0" width="22" height="14" fill="#005EB8" />
              {/* Yellow Nordic cross */}
              <Rect x="7" y="0" width="3" height="14" fill="#FECC00" />
              <Rect x="0" y="5" width="22" height="3" fill="#FECC00" />
            </Svg>
            <Text style={[styles.langLabel, lang === 'sv' && styles.activeText]}>SV</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, lang === 'fi' ? styles.active : styles.inactive]}
          onPress={() => setLang('fi')}
        >
          <View style={styles.flagBadgeContainer}>
            <Svg width={22} height={14} viewBox="0 0 22 14">
              <Rect x="0" y="0" width="22" height="14" fill="#FFFFFF" />
              <Rect x="7" y="0" width="3" height="14" fill="#003580" />
              <Rect x="0" y="5" width="22" height="3" fill="#003580" />
            </Svg>
            <Text style={[styles.langLabel, lang === 'fi' && styles.activeText]}>FI</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, lang === 'en' ? styles.active : styles.inactive]}
          onPress={() => setLang('en')}
        >
          <View style={styles.flagBadgeContainer}>
            <Svg width={22} height={14} viewBox="0 0 22 14">
              {/* Blue background */}
              <Rect x="0" y="0" width="22" height="14" fill="#012169" />
              {/* White diagonals (broad) */}
              <Rect x="-6" y="6" width="34" height="3" fill="#FFFFFF" transform="rotate(30 11 7)" />
              <Rect x="-6" y="6" width="34" height="3" fill="#FFFFFF" transform="rotate(-30 11 7)" />
              {/* Red diagonals (narrow) */}
              <Rect x="-6" y="6.4" width="34" height="1.5" fill="#C8102E" transform="rotate(30 11 7)" />
              <Rect x="-6" y="6.4" width="34" height="1.5" fill="#C8102E" transform="rotate(-30 11 7)" />
              {/* White cross */}
              <Rect x="9" y="0" width="4" height="14" fill="#FFFFFF" />
              <Rect x="0" y="5" width="22" height="4" fill="#FFFFFF" />
              {/* Red cross */}
              <Rect x="10.2" y="0" width="1.6" height="14" fill="#C8102E" />
              <Rect x="0" y="5.6" width="22" height="1.6" fill="#C8102E" />
            </Svg>
            <Text style={[styles.langLabel, lang === 'en' && styles.activeText]}>EN</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6e9ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  flagBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagBadge: {
    width: 22,
    height: 14,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  flagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  flagSE: {
    backgroundColor: '#005EB8',
  },
  flagFI: {
    backgroundColor: '#003580',
  },
  flagGB: {
    backgroundColor: '#1E90FF',
  },
  langLabel: {
    color: '#223',
    fontWeight: '700',
    marginLeft: 8,
  },
  inactive: {
    backgroundColor: 'transparent',
  },
  active: {
    backgroundColor: '#3498db',
  },
  text: {
    color: '#223',
    fontWeight: '700',
  },
  activeText: {
    color: '#fff',
  }
});
