/**
 * Location Selector Component
 * Allows users to select preset locations or use GPS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { PRESET_LOCATIONS } from '../data/locations';
import { getCurrentLocation, validateCoordinates } from '../services/locationService';

export default function LocationSelector({ selectedLocation, onLocationSelect }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleCustomLocation = () => {
    if (validateCoordinates(customLat, customLon)) {
      onLocationSelect({
        name: 'Anpassad plats',
        latitude: parseFloat(customLat),
        longitude: parseFloat(customLon),
      });
      setModalVisible(false);
      setCustomLat('');
      setCustomLon('');
    } else {
      Alert.alert('Fel', 'Ogiltiga koordinater. Kontrollera dina värden.');
    }
  };

  const handleGPSLocation = async () => {
    try {
      const location = await getCurrentLocation();
      onLocationSelect(location);
      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        'GPS-fel',
        'Kunde inte hämta din plats. Kontrollera att du har gett platsbehörighet.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>
          📍 {selectedLocation ? selectedLocation.name : 'Välj plats'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Välj plats</Text>

            {/* Search bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Sök plats..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* GPS Button */}
            <TouchableOpacity style={styles.gpsButton} onPress={handleGPSLocation}>
              <Text style={styles.gpsButtonText}>📍 Använd min plats (GPS)</Text>
            </TouchableOpacity>

            {/* Preset locations list */}
            <FlatList
              data={filteredLocations}
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
            />

            {/* Custom coordinates */}
            <View style={styles.customSection}>
              <Text style={styles.customTitle}>Anpassade koordinater</Text>
              <View style={styles.customInputs}>
                <TextInput
                  style={styles.coordInput}
                  placeholder="Latitud"
                  keyboardType="numeric"
                  value={customLat}
                  onChangeText={setCustomLat}
                />
                <TextInput
                  style={styles.coordInput}
                  placeholder="Longitud"
                  keyboardType="numeric"
                  value={customLon}
                  onChangeText={setCustomLon}
                />
              </View>
              <TouchableOpacity style={styles.customButton} onPress={handleCustomLocation}>
                <Text style={styles.customButtonText}>Använd koordinater</Text>
              </TouchableOpacity>
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Stäng</Text>
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
  customSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordInput: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
    fontSize: 14,
  },
  customButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
});
