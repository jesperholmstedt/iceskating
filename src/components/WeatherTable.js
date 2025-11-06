/**
 * Weather Table Component
 * Displays weather data in a table format
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function WeatherTable({ weatherData }) {
  if (!weatherData || weatherData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Ingen väderdata tillgänglig</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    return `${days[date.getDay()]} ${date.getDate()} ${date.toLocaleDateString('sv-SE', { month: 'short' })}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detaljerad väderprognos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerCell, styles.dateCell]}>Datum</Text>
            <Text style={[styles.cell, styles.headerCell, styles.tempCell]}>Max °C</Text>
            <Text style={[styles.cell, styles.headerCell, styles.tempCell]}>Min °C</Text>
            <Text style={[styles.cell, styles.headerCell, styles.windCell]}>Max vind m/s</Text>
            <Text style={[styles.cell, styles.headerCell, styles.precipCell]}>Regn mm</Text>
            <Text style={[styles.cell, styles.headerCell, styles.snowCell]}>Snö mm</Text>
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
                <Text style={[styles.cell, styles.tempCell, day.tempMax > 0 && styles.aboveZero]}>
                  {day.tempMax?.toFixed(1) || '-'}
                </Text>
                <Text style={[styles.cell, styles.tempCell, day.tempMin < 0 && styles.belowZero]}>
                  {day.tempMin?.toFixed(1) || '-'}
                </Text>
                <Text style={[styles.cell, styles.windCell]}>
                  {day.windSpeed?.toFixed(1) || '-'}
                  {day.windSpeedTime && (
                    <Text style={styles.timeText}>{'\n'}{day.windSpeedTime}</Text>
                  )}
                </Text>
                <Text style={[styles.cell, styles.precipCell]}>
                  {day.precipitation?.toFixed(1) || '0.0'}
                </Text>
                <Text style={[styles.cell, styles.snowCell]}>
                  {(day.snowfall * 10)?.toFixed(1) || '0.0'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    padding: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dateCell: {
    width: 90,
    textAlign: 'left',
  },
  tempCell: {
    width: 70,
  },
  windCell: {
    width: 70,
  },
  precipCell: {
    width: 70,
  },
  snowCell: {
    width: 70,
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
