/**
 * Location Selector Component
 * Allows users to select preset locations or use GPS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PRESET_LOCATIONS } from '../data/locations';
import { useTranslation } from '../i18n';
import { formatCoordinates } from '../services/locationService';

export default function LocationSelector({ selectedLocation, onLocationSelect, currentWeather }) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [showPresets, setShowPresets] = useState(true);

  // Debounce search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
        setShowPresets(true);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const searchLocations = async (query) => {
    setIsSearching(true);
    setShowPresets(false);
    
    try {
      // Using Nominatim (OpenStreetMap) geocoding API
      // Limiting search to Nordic countries
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=se,no,fi,dk,is&` + // Sweden, Norway, Finland, Denmark, Iceland
        `format=json&` +
        `limit=10&` +
        `addressdetails=1`
      );
      
      const data = await response.json();
      
      const results = data.map((item) => ({
        id: item.place_id.toString(),
        name: item.name || item.display_name.split(',')[0],
        region: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        country: item.address?.country || '',
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(t('alertError'), t('alertSearchFail'));
    } finally {
      setIsSearching(false);
    }
  };

  const filteredLocations = searchQuery
    ? PRESET_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PRESET_LOCATIONS;

  const handlePresetSelect = (location) => {
    onLocationSelect(location);
    setModalVisible(false);
  };

  // GPS location option removed per request

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>
          📍 {t('selectLocationButton')}
        </Text>
      </TouchableOpacity>

      {selectedLocation && (
        <View style={styles.locationInfoBox}>
          <Text style={styles.locationNameBig}>{selectedLocation.name}</Text>
          {selectedLocation.region ? (
            <Text style={styles.locationRegionSmall}>{selectedLocation.region}</Text>
          ) : null}
          <Text style={styles.coordinatesSmall}>{formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}</Text>
          {currentWeather && typeof currentWeather.tempMax === 'number' && typeof currentWeather.snowfall === 'number' && (
            <Text style={styles.currentWeatherSmall}>🌡️ {currentWeather.tempMax.toFixed(1)}°C, 🌨️ {currentWeather.snowfall.toFixed(1)} cm</Text>
          )}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('modalTitleSelect')}</Text>

            {/* Search bar */}
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Loading indicator */}
            {isSearching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.loadingText}>{t('searching')}</Text>
              </View>
            )}

            {/* GPS Button removed per user request */}

            {/* Search results or preset locations list */}
            <FlatList
              data={showPresets ? filteredLocations : searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.locationItem}
                  onPress={() => handlePresetSelect(item)}
                >
                  <Text style={styles.locationName}>
                    {item.country} {item.name}
                  </Text>
                  <Text style={styles.locationRegion}>{item.region}</Text>
                </TouchableOpacity>
              )}
              style={styles.locationList}
              ListEmptyComponent={
                !isSearching && searchQuery.length >= 3 ? (
                  <Text style={styles.emptyText}>{t('noLocationsFound')}</Text>
                ) : null
              }
            />

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  gpsButton: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  gpsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  locationList: {
    maxHeight: 250,
    marginBottom: 12,
  },
  locationItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationRegion: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationInfoBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationNameBig: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  locationRegionSmall: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
  },
  coordinatesSmall: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  currentWeatherSmall: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 8,
    fontWeight: '500',
  },
});
