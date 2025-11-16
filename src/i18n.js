import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  sv: {
    headerSubtitle: 'Väderprognos för långfärdsskridskoåkning',
    welcomeTitle: 'Välkommen!',
    welcomeChoose: 'Välj en plats ovan för att se väderprognos och skridskoförhållanden',
    welcomeInfo: '📊 Visar 5 dagar historik och 5 dagar prognos\n❄️ Analyserar isbildning och skridskoförhållanden\n🌡️ Temperatur, vind, nederbörd och snöfall',
    loading: 'Hämtar väderdata...',
    noData: 'Ingen väderdata tillgänglig',
  chartTitle: 'Temperatur över tid',
  chartLegendMax: 'Max temp (°C)',
  chartLegendMin: 'Min temp (°C)',
  todayLabel: 'Idag:',
    pullToRefresh: 'Dra nedåt för att hämta väderdata',
  selectLocationButton: 'Välj ort',
  modalTitleSelect: 'Välj plats',
  searchPlaceholder: 'Sök plats i Norden...',
  searching: 'Söker...',
  // GPS option removed from UI; key kept for compatibility if needed
  useMyLocation: '📍 Använd min plats (GPS)',
  noLocationsFound: 'Inga platser hittades',
  close: 'Stäng',
  alertError: 'Fel',
  alertSearchFail: 'Kunde inte söka platser. Försök igen.',
  alertGpsFail: 'Kunde inte hämta din plats. Kontrollera att du har gett platsbehörighet.',
    dataFrom: 'Data från Open-Meteo API 🌍',
    weatherTableTitle: 'Detaljerad väderprognos',
    date: 'Datum',
    maxTemp: 'Max °C',
    minTemp: 'Min °C',
    maxWind: 'Max vind m/s',
    snow: 'Snö cm',
    iceTitle: 'Skridskoförhållanden',
    freezeDaysLabel: '❄️ Frysningsdagar senaste 5 dagarna:',
    freezeDaysExplain: 'Antal dagar inom de senaste 5 dagarna där den lägsta temperaturen varit under 0°C.',
    pastSnowLabel: '🌨️ Snöfall gångna 5 dagar:',
    pastSnowExplain: 'Totalt snöfall för de senaste 5 dagarna (historiska data).',
    futureSnowLabel: '🌨️ Snöfall kommande 5 dagar:',
    futureSnowExplain: 'Förväntat snöfall för de kommande 5 dagarna (prognos).',
    minusNoSnowLabel: '❄️ Minusgrader utan snö (senaste 5 dagar):',
    minusNoSnowExplain: 'Antal dagar under de senaste 5 dagarna där min-temperaturen varit under 0°C och inget snöfall observerats.',
    webcamsTitle: '🔎 Webbkameror',
    webcamsSubtitle: 'Öppna sökresultat för webbkameror nära platsen.',
    webcamsButton: 'Sök webbkameror (Google)',
  // NearbyFinder translations removed (feature deprecated)
    center: 'Centrum',
    change: 'Byt',
    radiusKm: 'Radie (km)',
    findNearby: 'Sök inom radie',
    results: 'Resultat',
    noIceFound: 'Inga platser med sannolikhet för skridskois hittades inom 200 km.',
  noSuitableResultsIntro: 'Inga platser inom en radie på 200km verkar lämpliga för skridskoåkning. Det kan bero på att det inte funnits tillräckligt många kalla dagar utan nysnö, att nyligen fallen snö täckt potentiell is, eller att inga lämpliga platser finns i det här området.',
  highestScoreWas: 'Högsta poäng var',
    manualLatLabel: 'Latitud',
    manualLonLabel: 'Longitud',
    useCoordinates: 'Använd koordinater',
    searchPlaceholderNominatim: 'Sök plats...',
    searchingNominatim: 'Söker platser...',
    errorFetch: 'Kunde inte hämta väderdata. Försök igen senare.'
  },
  en: {
    headerSubtitle: 'Weather forecast for long-distance ice skating',
    welcomeTitle: 'Welcome!',
    welcomeChoose: 'Select a location above to see forecast and ice conditions',
    welcomeInfo: '📊 Shows 5 days history and 5 days forecast\n❄️ Analyses ice formation and skating conditions\n🌡️ Temperature, wind, precipitation and snowfall',
    loading: 'Fetching weather data...',
    noData: 'No weather data available',
  chartTitle: 'Temperature over time',
  chartLegendMax: 'Max temp (°C)',
  chartLegendMin: 'Min temp (°C)',
  todayLabel: 'Today:',
    pullToRefresh: 'Pull down to refresh data',
  selectLocationButton: 'Choose location',
  modalTitleSelect: 'Select location',
  searchPlaceholder: 'Search place in Nordic countries...',
  searching: 'Searching...',
  useMyLocation: '📍 Use my location (GPS)',
  noLocationsFound: 'No locations found',
  close: 'Close',
  alertError: 'Error',
  alertSearchFail: 'Could not search locations. Please try again.',
  alertGpsFail: 'Could not get your location. Ensure location permission is granted.',
    dataFrom: 'Data from Open-Meteo API 🌍',
    weatherTableTitle: 'Detailed weather forecast',
    date: 'Date',
    maxTemp: 'Max °C',
    minTemp: 'Min °C',
    maxWind: 'Max wind m/s',
    snow: 'Snow cm',
    iceTitle: 'Ice conditions',
    freezeDaysLabel: '❄️ Freezing days (last 5 days):',
    freezeDaysExplain: 'Number of days in the last 5 days where the minimum temperature was below 0°C.',
    pastSnowLabel: '🌨️ Snowfall past 5 days:',
    pastSnowExplain: 'Total snowfall for the past 5 days (historical data).',
    futureSnowLabel: '🌨️ Snowfall next 5 days:',
    futureSnowExplain: 'Expected snowfall for the next 5 days (forecast).',
    minusNoSnowLabel: '❄️ Subzero w/o snow (last 5 days):',
    minusNoSnowExplain: 'Number of days in the last 5 days with min temp < 0°C and no snowfall observed.',
    webcamsTitle: '🔎 Webcams',
    webcamsSubtitle: 'Open search results for webcams near the selected location.',
    webcamsButton: 'Search webcams (Google)',
  // NearbyFinder translations removed (feature deprecated)
    center: 'Center',
    change: 'Change',
    radiusKm: 'Radius (km)',
    findNearby: 'Find within radius',
    results: 'Results',
  noIceFound: 'Inga platser med sannolikhet för skridskois hittades inom 200 km.',
  noSuitableResultsIntro: 'No places within a 200 km radius appear suitable for skating. This may be because there haven\'t been enough sustained freezing days without fresh snowfall, recent snowfall has covered potential ice, or there simply aren\'t any suitable sites in the area.',
  highestScoreWas: 'Highest score was',
    manualLatLabel: 'Latitude',
    manualLonLabel: 'Longitude',
    useCoordinates: 'Use coordinates',
    searchPlaceholderNominatim: 'Search place...',
    searchingNominatim: 'Searching places...',
    errorFetch: 'Could not fetch weather data. Please try again later.'
  },
  fi: {
    headerSubtitle: 'Sääennuste retkiluisteluun',
    welcomeTitle: 'Tervetuloa!',
    welcomeChoose: 'Valitse sijainti ylhäältä nähdäksesi ennusteen ja jääolosuhteet',
    welcomeInfo: '📊 Näyttää 5 päivän historian ja 5 päivän ennusteen\n❄️ Analysoi jäänmuodostusta ja luisteluolosuhteita\n🌡️ Lämpötila, tuuli, sademäärä ja lumisade',
    loading: 'Haetaan säätietoja...',
    noData: 'Ei säätietoja saatavilla',
  chartTitle: 'Lämpötila ajan mittaan',
  chartLegendMax: 'Max lämpö (°C)',
  chartLegendMin: 'Min lämpö (°C)',
  todayLabel: 'Tänään:',
    pullToRefresh: 'Vedä alas päivittääksesi tiedot',
  selectLocationButton: 'Valitse paikka',
  modalTitleSelect: 'Valitse paikka',
  searchPlaceholder: 'Hae paikka Pohjoismaista...',
  searching: 'Haetaan...',
  useMyLocation: '📍 Käytä sijaintiani (GPS)',
  noLocationsFound: 'Paikkoja ei löytynyt',
  close: 'Sulje',
  alertError: 'Virhe',
  alertSearchFail: 'Paikkojen hakeminen epäonnistui. Yritä uudelleen.',
  alertGpsFail: 'Paikkaa ei voitu hakea. Varmista, että sijaintilupa on annettu.',
    dataFrom: 'Data: Open-Meteo API 🌍',
    weatherTableTitle: 'Yksityiskohtainen sääennuste',
    date: 'Päivä',
    maxTemp: 'Max °C',
    minTemp: 'Min °C',
    maxWind: 'Max tuuli m/s',
    snow: 'Lumi cm',
    iceTitle: 'Jääolosuhteet',
    freezeDaysLabel: '❄️ Pakastuspäivät viime 5 päivän aikana:',
    freezeDaysExplain: 'Päivien määrä viimeisen 5 päivän aikana, jolloin alin lämpötila oli alle 0°C.',
    pastSnowLabel: '🌨️ Lumisade viimeiset 5 päivää:',
    pastSnowExplain: 'Kokonaislumisade viimeisten 5 päivän aikana (historiallinen data).',
    futureSnowLabel: '🌨️ Lumisade seuraavat 5 päivää:',
    futureSnowExplain: 'Ennustettu lumisade seuraavien 5 päivän aikana.',
    minusNoSnowLabel: '❄️ Alle 0°C ilman lunta (viime 5 päivää):',
    minusNoSnowExplain: 'Päivien määrä viimeisen 5 päivän aikana, jolloin alin lämpötila oli alle 0°C eikä lunta havaittu.',
    webcamsTitle: '🔎 Web-kamerat',
    webcamsSubtitle: 'Avaa hakutulokset web-kameroista lähellä sijaintia.',
    webcamsButton: 'Etsi web-kameroita (Google)',
  // NearbyFinder translations removed (feature deprecated)
    center: 'Keskus',
    change: 'Vaihda',
    radiusKm: 'Säde (km)',
    findNearby: 'Etsi säteellä',
    results: 'Tulokset',
  noIceFound: 'Inga platser med sannolikhet för skridskois hittades inom 200 km.',
  noSuitableResultsIntro: 'Yhtään paikkaa 200 km säteellä ei vaikuta sopivalta luisteluun. Syynä voi olla, ettei ole ollut riittävästi jatkuvia pakkaspäiviä ilman uutta lumisadetta, äskettäinen lumisade on peittänyt mahdollisen jään, tai alueella ei yksinkertaisesti ole sopivia paikkoja.',
  highestScoreWas: 'Suurin pistemäärä oli',
    manualLatLabel: 'Leveysaste',
    manualLonLabel: 'Pituusaste',
    useCoordinates: 'Käytä koordinaatteja',
    searchPlaceholderNominatim: 'Hae paikka...',
    searchingNominatim: 'Haetaan paikkoja...',
    errorFetch: 'Säätietoja ei saatu haettua. Yritä myöhemmin uudelleen.'
  }
};

const LanguageContext = createContext();

const STORAGE_KEY = '@skating_weather_lang';

export function LanguageProvider({ children }) {
  // Try to detect browser/device language; fall back to Swedish ('sv')
  const detectLang = () => {
    try {
      const nav = typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : null;
      if (!nav) return 'sv';
      if (nav.startsWith('fi')) return 'fi';
      if (nav.startsWith('en')) return 'en';
      return 'sv';
    } catch (e) {
      return 'sv';
    }
  };

  const [lang, setLangState] = useState(detectLang());

  // Load persisted language (if any) on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          setLangState(stored);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setLang = async (newLang) => {
    try {
      setLangState(newLang);
      await AsyncStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to persist language', e);
    }
  };

  const t = (key) => {
    const section = translations[lang] || translations.sv;
    return section[key] || translations.sv[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);

export default translations;
