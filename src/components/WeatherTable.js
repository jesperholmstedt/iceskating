/**
 * Weather Table Component
 * Displays weather data in a table format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n';

export default function WeatherTable({ weatherData }) {
  const { t, lang } = useTranslation();
  if (!weatherData || weatherData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>{t('noData')}</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Use locale-aware short weekday and short month
    const locale = lang === 'sv' ? 'sv-SE' : lang === 'fi' ? 'fi-FI' : 'en-US';
    const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'short' });
    return `${weekday} ${day} ${month}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('weatherTableTitle')}</Text>
      <View style={styles.tableContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.headerCell, styles.dateCell]}>{t('date')}</Text>
          <Text style={[styles.cell, styles.headerCell, styles.tempCell]}>{t('maxTemp')}</Text>
          <Text style={[styles.cell, styles.headerCell, styles.tempCell]}>{t('minTemp')}</Text>
          <Text style={[styles.cell, styles.headerCell, styles.windCell]}>{t('maxWind')}</Text>
          <Text style={[styles.cell, styles.headerCell, styles.snowCell]}>{t('snow')}</Text>
        </View>

        {/* Data Rows */}
        {weatherData.map((day, index) => {
          const isPast = new Date(day.date) < new Date().setHours(0, 0, 0, 0);
          const isToday = new Date(day.date).toDateString() === new Date().toDateString();

          return (
            <View
              key={index}
              style={[
                styles.row,
                isPast && styles.pastRow,
                isToday && styles.todayRow
              ]}
            >
              <Text style={[styles.cell, styles.dateCell, isToday && styles.todayText]}>
                {formatDate(day.date)}
              </Text>
              <Text style={[styles.cell, styles.tempCell, day.tempMax > 0 && styles.aboveZero, day.tempMax < 0 && styles.belowZero]}>
                {day.tempMax ? `${day.tempMax.toFixed(1)}°C` : '-'}
              </Text>
              <Text style={[styles.cell, styles.tempCell, day.tempMin < 0 && styles.belowZero]}>
                {day.tempMin ? `${day.tempMin.toFixed(1)}°C` : '-'}
              </Text>
              <Text style={[styles.cell, styles.windCell]}>
                {day.windSpeed ? `${day.windSpeed.toFixed(1)} m/s` : '-'}
                {day.windSpeedTime && (
                  <Text style={styles.timeText}>{'\n'}{day.windSpeedTime}</Text>
                )}
              </Text>
              <Text style={[styles.cell, styles.snowCell]}>
                {typeof day.snowfall === 'number' ? `${day.snowfall.toFixed(1)} cm` : '0.0 cm'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    paddingHorizontal: 16,
  },
  tableContainer: {
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pastRow: {
    backgroundColor: '#f5f5f5',
  },
  todayRow: {
    backgroundColor: '#fff9e6',
  },
  cell: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dateCell: {
    width: 100, // Fixed width for date column
    textAlign: 'left',
  },
  tempCell: {
    width: 90, // Fixed width for temperature columns
  },
  windCell: {
    width: 90, // Fixed width for wind column
  },
  snowCell: {
    width: 70, // Fixed width for snow column
  },
  timeText: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: 'normal',
  },
  aboveZero: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  belowZero: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  todayText: {
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 16,
    color: '#999',
    padding: 20,
    textAlign: 'center',
  },
});
