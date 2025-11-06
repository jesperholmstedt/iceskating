/**
 * Weather Chart Component
 * Displays temperature and other weather data in a line chart
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function WeatherChart({ weatherData }) {
  if (!weatherData || weatherData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Ingen väderdata tillgänglig</Text>
      </View>
    );
  }

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prepare data for the chart
  const labels = weatherData.map((day) => {
    const date = new Date(day.date);
    const dayDate = `${date.getDate()}/${date.getMonth() + 1}`;
    
    // Check if this is today
    const dataDate = new Date(day.date);
    dataDate.setHours(0, 0, 0, 0);
    const isToday = dataDate.getTime() === today.getTime();
    
    return isToday ? `★${dayDate}★` : dayDate;
  });

  const tempMaxData = weatherData.map((day) => day.tempMax || 0);
  const tempMinData = weatherData.map((day) => day.tempMin || 0);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: tempMaxData,
        color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`, // Red for max temp
        strokeWidth: 2,
      },
      {
        data: tempMinData,
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue for min temp
        strokeWidth: 2,
      },
    ],
    legend: ['Max temp (°C)', 'Min temp (°C)'],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f0f0f0',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  // Function to render temperature values at each dot
  const renderDotContent = ({ x, y, index, indexData }) => {
    return (
      <SvgText
        key={`${x}-${y}-${index}`}
        x={x}
        y={y - 10}
        fill="#333"
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
      >
        {Math.round(indexData)}°
      </SvgText>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperatur över tid</Text>
      <Text style={styles.subtitle}>★ = Idag</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        renderDotContent={renderDotContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    fontSize: 16,
    color: '#999',
    padding: 20,
  },
});
