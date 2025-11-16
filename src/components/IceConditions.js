/**
 * Ice Conditions Component
 * Displays ice formation analysis based on weather data
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '../i18n';
import Webcams from './Webcams';

export default function IceConditions({ analysis, weatherData, selectedLocation }) {
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useTranslation();

  if (!analysis) {
    return null;
  }

  // Ice-opportunity messaging removed per user request.

  // Qualitative assessment removed — UI will show factual data only

  // Get last 14 days of freezing history
  const getFreezingHistory = () => {
    if (!weatherData) return [];

    let consecutiveCount = 0;
    return weatherData.slice(-14).map(day => {
      const isFreezingDay = day.tempMax < 0;

      if (isFreezingDay) {
        consecutiveCount++;
      } else {
        consecutiveCount = 0;
      }

      return {
        date: day.date,
        tempMax: day.tempMax,
        tempMin: day.tempMin,
        isFreezingDay: isFreezingDay,
        consecutiveFreezing: consecutiveCount
      };
    });
  };

  const freezingHistory = getFreezingHistory();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>{t('freezeDaysLabel')}</Text>
              <Text style={styles.explanation}>{t('freezeDaysExplain')}</Text>
            </View>
            <Text style={styles.detailValue}>{analysis.maxConsecutiveFreezingDays}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>{t('pastSnowLabel')}</Text>
              <Text style={styles.explanation}>{t('pastSnowExplain')}</Text>
            </View>
            <Text style={styles.detailValue}>{analysis.pastSnowfall.toFixed(1)} cm</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>{t('futureSnowLabel')}</Text>
              <Text style={styles.explanation}>{t('futureSnowExplain')}</Text>
            </View>
            <Text style={styles.detailValue}>{analysis.futureSnowfall.toFixed(1)} cm</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>{t('minusNoSnowLabel')}</Text>
              <Text style={styles.explanation}>{t('minusNoSnowExplain')}</Text>
            </View>
            <Text style={styles.detailValue}>{analysis.freezingNoSnowDays}</Text>
          </View>
          {/* Ice opportunity message removed — user chose to reconsider. */}
        </View>

        {/* Frysningshistorik removed per request */}
        <Webcams location={selectedLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerText: {
    color: '#222',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    padding: 12,
  },
  message: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  labelContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: '#2f2f2f',
    fontWeight: '600',
  },
  explanation: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b6fa4',
  },
  warning: {
    color: '#e74c3c',
  },
  historyToggle: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  historyToggleText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  historyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  historyScroll: {
    maxHeight: 200,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 50,
  },
  historyTemp: {
    fontSize: 14,
    color: '#666',
    width: 60,
    textAlign: 'center',
  },
  historyStatus: {
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 80,
  },
  historyStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  historyStatusContainer: {
    alignItems: 'center',
  },
  freezingDay: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  nonFreezingDay: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
  historyNote: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  note: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  
});
