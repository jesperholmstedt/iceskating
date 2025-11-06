/**
 * Ice Conditions Component
 * Displays ice formation analysis based on weather data
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function IceConditions({ analysis, weatherData }) {
  const [showHistory, setShowHistory] = useState(false);

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
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>❄️ Frysningsdagar senaste 7 dagarna:</Text>
              <Text style={styles.explanation}>
                Antal dagar inom de senaste 7 dagarna där max temperaturen varit under 0°C.
              </Text>
            </View>
            <Text style={styles.detailValue}>{analysis.maxConsecutiveFreezingDays}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌡️ Tö förekommit:</Text>
            <Text style={[styles.detailValue, analysis.hasThawing && styles.warning]}>
              {analysis.hasThawing ? 'Ja' : 'Nej'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>🌨️ Snöfall gångna 5 dagar:</Text>
              <Text style={styles.explanation}>
                Totalt snöfall för de senaste 5 dagarna (historiska data).
              </Text>
            </View>
            <Text style={styles.detailValue}>{(analysis.pastSnowfall * 10).toFixed(1)} mm</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Text style={styles.detailLabel}>🌨️ Snöfall kommande 5 dagar:</Text>
              <Text style={styles.explanation}>
                Förväntat snöfall för de kommande 5 dagarna (prognos).
              </Text>
            </View>
            <Text style={styles.detailValue}>{(analysis.futureSnowfall * 10).toFixed(1)} mm</Text>
          </View>
        </View>

        {/* History Toggle */}
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.historyToggleText}>
            {showHistory ? '🔽' : '▶️'} Visa senaste 14 dagarnas frysningshistorik
          </Text>
        </TouchableOpacity>

        {/* Freezing History */}
        {showHistory && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Frysningshistorik (senaste 14 dagar):</Text>
            <ScrollView style={styles.historyScroll}>
              {freezingHistory.map((day, index) => {
                const date = new Date(day.date);
                return (
                  <View key={index} style={styles.historyRow}>
                    <Text style={styles.historyDate}>
                      {date.getDate()} {date.toLocaleDateString('sv-SE', { month: 'short' })}
                    </Text>
                    <Text style={styles.historyTemp}>
                      {day.tempMax.toFixed(1)}°C
                    </Text>
                    <View style={styles.historyStatusContainer}>
                      <View style={[
                        styles.historyStatusIndicator,
                        day.isFreezingDay ? styles.freezingDay : styles.nonFreezingDay
                      ]}>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.historyNote}>
              * Frysningsdag = max-temp under 0°C (senaste 7 dagarna räknas för isförhållanden)
            </Text>
          </View>
        )}
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
  labelContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  explanation: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
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
