/**
 * Location Service
 * Handles GPS location, manual input, and AsyncStorage for saving locations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const STORAGE_KEY = '@skating_weather_last_location';

/**
 * Get current GPS location
 * @returns {Promise<Object>} Location object with latitude and longitude
 */
export async function getCurrentLocation() {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      name: 'Min plats',
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
}

/**
 * Save location to AsyncStorage
 * @param {Object} location - Location object
 */
export async function saveLastLocation(location) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location:', error);
  }
}

/**
 * Get last saved location from AsyncStorage
 * @returns {Promise<Object|null>} Last saved location or null
 */
export async function getLastLocation() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting last location:', error);
    return null;
  }
}

/**
 * Validate coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  return !isNaN(lat) && !isNaN(lon) && 
         lat >= -90 && lat <= 90 && 
         lon >= -180 && lon <= 180;
}

/**
 * Format coordinates for display
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string}
 */
export function formatCoordinates(latitude, longitude) {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'Ö' : 'V';
  
  return `${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lonDir}`;
}
