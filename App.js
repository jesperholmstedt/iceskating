/**
 * Main App Component
 * Skating Weather App for long-distance ice skating
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LanguageProvider, useTranslation } from './src/i18n';
import LanguageSelector from './src/components/LanguageSelector';

// Components
import LocationSelector from './src/components/LocationSelector';
import WeatherChart from './src/components/WeatherChart';
import WeatherTable from './src/components/WeatherTable';
import IceConditions from './src/components/IceConditions';

// Services
import { fetchWeatherData, analyzeIceConditions } from './src/services/weatherService';
import { getLastLocation, saveLastLocation, formatCoordinates } from './src/services/locationService';

function InnerApp() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [iceAnalysis, setIceAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

  const getCurrentWeather = () => {
    if (!weatherData?.data) return null;
    const today = new Date().toISOString().split('T')[0];
    return weatherData.data.find(day => day.date === today);
  };

  useEffect(() => {
    (async () => {
      try {
        const lastLoc = await getLastLocation();
        if (lastLoc) setSelectedLocation(lastLoc);
      } catch (err) {
        console.error('Error loading last location:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadWeatherData();
      saveLastLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const loadWeatherData = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(
        selectedLocation.latitude,
        selectedLocation.longitude,
        7,
        5
      );
      setWeatherData(data);
      const analysis = analyzeIceConditions(data.data);
      setIceAnalysis(analysis);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(t('errorFetch'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeatherData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{t('headerSubtitle')}</Text>
        <LanguageSelector />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          currentWeather={getCurrentWeather()}
        />

        {/* Location info moved into LocationSelector so it appears directly under the select button */}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {!loading && !error && weatherData && (
          <>
            <IceConditions analysis={iceAnalysis} weatherData={weatherData?.data} selectedLocation={selectedLocation} />
            <WeatherChart weatherData={weatherData.data} />
            <WeatherTable weatherData={weatherData.data} />
          </>
        )}

        {!loading && !error && !weatherData && selectedLocation && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('pullToRefresh')}</Text>
          </View>
        )}

        {!selectedLocation && !loading && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>{t('welcomeTitle')}</Text>
            <Text style={styles.welcomeText}>{t('welcomeChoose')}</Text>
            <Text style={styles.welcomeInfo}>{t('welcomeInfo')}</Text>
          </View>
        )}

  {/* NearbyFinder removed */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('dataFrom')}</Text>
          <Text style={styles.footerSubtext}>
            Gjord av Jesper Holmstedt | jesperholmstedt(a)gmail.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <InnerApp />
    </LanguageProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 10,
  },
 
  headerSubtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  locationRegion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  currentWeather: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  errorText: {
    fontSize: 16,
    color: '#c0392b',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  welcomeContainer: {
    padding: 30,
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  welcomeInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'left',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
});
