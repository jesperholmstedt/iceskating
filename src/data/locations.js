/**
 * Preset locations for quick access
 * Finnish Lapland and Swedish mountain locations
 */

export const PRESET_LOCATIONS = [
  // Finnish Lapland
  {
    id: 'kilpisjarvi',
    name: 'Kilpisjärvi',
    country: '🇫🇮 Finland',
    latitude: 69.02,
    longitude: 20.79,
    region: 'Finska Lappland'
  },
  {
    id: 'inari',
    name: 'Inari',
    country: '🇫🇮 Finland',
    latitude: 68.91,
    longitude: 27.03,
    region: 'Finska Lappland'
  },
  {
    id: 'rovaniemi',
    name: 'Rovaniemi',
    country: '🇫🇮 Finland',
    latitude: 66.50,
    longitude: 25.73,
    region: 'Finska Lappland'
  },
  {
    id: 'enontekio',
    name: 'Enontekiö',
    country: '🇫🇮 Finland',
    latitude: 68.39,
    longitude: 23.63,
    region: 'Finska Lappland'
  },
  {
    id: 'saariselka',
    name: 'Saariselkä',
    country: '🇫🇮 Finland',
    latitude: 68.42,
    longitude: 27.41,
    region: 'Finska Lappland'
  },
  // Swedish mountain range
  {
    id: 'abisko',
    name: 'Abisko',
    country: '🇸🇪 Sverige',
    latitude: 68.35,
    longitude: 18.83,
    region: 'Svenska fjällkedjan'
  },
  {
    id: 'are',
    name: 'Åre',
    country: '🇸🇪 Sverige',
    latitude: 63.40,
    longitude: 13.08,
    region: 'Svenska fjällkedjan'
  },
  {
    id: 'funasdalen',
    name: 'Funäsdalen',
    country: '🇸🇪 Sverige',
    latitude: 62.52,
    longitude: 12.53,
    region: 'Svenska fjällkedjan'
  },
  {
    id: 'kiruna',
    name: 'Kiruna',
    country: '🇸🇪 Sverige',
    latitude: 67.85,
    longitude: 20.23,
    region: 'Svenska fjällkedjan'
  },
  {
    id: 'riksgransen',
    name: 'Riksgränsen',
    country: '🇸🇪 Sverige',
    latitude: 68.43,
    longitude: 18.13,
    region: 'Svenska fjällkedjan'
  },
  {
    id: 'stromsund',
    name: 'Strömsund',
    country: '🇸🇪 Sverige',
    latitude: 63.85,
    longitude: 15.55,
    region: 'Svenska fjällkedjan'
  }
];

/**
 * Get location by ID
 * @param {string} id 
 * @returns {Object|null}
 */
export function getLocationById(id) {
  return PRESET_LOCATIONS.find(loc => loc.id === id) || null;
}

/**
 * Search locations by name
 * @param {string} query 
 * @returns {Array}
 */
export function searchLocations(query) {
  const lowerQuery = query.toLowerCase();
  return PRESET_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(lowerQuery) ||
    loc.region.toLowerCase().includes(lowerQuery)
  );
}
