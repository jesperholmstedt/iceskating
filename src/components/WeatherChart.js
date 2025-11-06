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

  // Find today's index in the data
  const todayIndex = weatherData.findIndex((day) => {
    const dataDate = new Date(day.date);
    dataDate.setHours(0, 0, 0, 0);
    return dataDate.getTime() === today.getTime();
  });

  // Prepare data for the chart
  const labels = weatherData.map((day) => {
    const date = new Date(day.date);
    return date.getDate().toString(); // Only show day number
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
      r: (opacity = 1) => '4', // Default size
      strokeWidth: '2',
    },
  };

  // Function to render temperature values at each dot
  const renderDotContent = ({ x, y, index, indexData }) => {
    const isToday = index === todayIndex;
    
    return (
      <React.Fragment>
        <SvgText
          key={`temp-${x}-${y}-${index}`}
          x={x}
          y={y - 10}
          fill="#333"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          {Math.round(indexData)}°
        </SvgText>
        {isToday && (
          <SvgText
            key={`today-${x}-${y}-${index}`}
            x={x}
            y={y + 25}
            fill="#e74c3c"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            ●
          </SvgText>
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperatur över tid</Text>
      {todayIndex !== -1 && (
        <Text style={styles.todayIndicator}>
          Idag: {today.getDate()} November
        </Text>
      )}
      <View style={styles.chartContainer}>
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
          getDotProps={(value, index) => {
            const isToday = index === todayIndex;
            return {
              r: isToday ? "6" : "4", // Larger dot for today
              strokeWidth: isToday ? "3" : "0", // Only today has stroke
              stroke: isToday ? "#e74c3c" : "transparent", // Only today has red stroke
            };
          }}
        />
      </View>
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
  todayIndicator: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
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
