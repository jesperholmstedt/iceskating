/**
 * Ice Conditions Component
 * Displays ice formation analysis based on weather data
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IceConditions({ analysis }) {
  if (!analysis) {
    return null;
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent':
        return '#27ae60';
      case 'good':
        return '#3498db';
      case 'moderate':
        return '#f39c12';
      case 'poor':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getConditionEmoji = (condition) => {
    switch (condition) {
      case 'excellent':
        return '⛸️✨';
      case 'good':
        return '⛸️';
      case 'moderate':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <View style={[styles.container, { borderColor: getConditionColor(analysis.condition) }]}>
      <View style={[styles.header, { backgroundColor: getConditionColor(analysis.condition) }]}>
        <Text style={styles.headerText}>
          {getConditionEmoji(analysis.condition)} Skridskoförhållanden
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>{analysis.message}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>❄️ Frysningsdagar i rad:</Text>
            <Text style={styles.detailValue}>{analysis.maxConsecutiveFreezingDays}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌡️ Tö förekommit:</Text>
            <Text style={[styles.detailValue, analysis.hasThawing && styles.warning]}>
              {analysis.hasThawing ? 'Ja' : 'Nej'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌨️ Total snöfall:</Text>
            <Text style={styles.detailValue}>{analysis.totalSnowfall.toFixed(1)} cm</Text>
          </View>
        </View>

        <Text style={styles.note}>
          💡 Tips: Bästa förhållandena uppstår vid konsekvent frysning, lite snö och låg vind.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  warning: {
    color: '#e74c3c',
  },
  note: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
