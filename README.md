# 🧊⛸️ Skridskoväder - Väderapp för Långfärdsskridskoåkning

En React Native (Expo) app som visar väderprognos för is skating i Finska Lappland och Svenska fjällkedjan.

## ✨ Funktioner

- 📊 **Väderhistorik**: 2-5 dagar bakåt
- 🔮 **Prognos**: 5 dagar framåt
- 🗺️ **11 Förinställda Platser**: Kilpisjärvi, Inari, Rovaniemi, Abisko, Åre, m.fl.
- 📍 **GPS-stöd**: Använd din nuvarande position
- 🧊 **Isanalys**: Automatisk bedömning av skridskoförhållanden
- 📈 **Grafer**: Temperaturdiagram med react-native-chart-kit
- 📋 **Tabell**: Detaljerad väderdata
- 💾 **Sparad Plats**: AsyncStorage för att komma ihåg senast valda plats

## 🚀 Kom Igång

### Installation

```bash
# Navigera till projektet
cd C:\Users\jespe\skating-weather-app

# Installera dependencies
npm install

# Starta utvecklingsserver
npm start

# Eller starta direkt för web
npm run web
```

### Kör på Olika Plattformar

- **Webb**: `npm run web` eller tryck `w` i terminalen
- **Android**: `npm run android` eller tryck `a`
- **iOS**: `npm run ios` eller tryck `i`
- **Expo Go**: Scanna QR-koden med Expo Go-appen

## 📱 Användning

1. Tryck på "📍 Välj plats"
2. Välj en plats från listan, använd GPS, eller ange koordinater
3. Se väderdata och isanalys automatiskt

## 🌐 Deployment

### GitHub + Cloudflare Pages

1. Push till GitHub
2. Lägg till secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
3. Push till `main` branch → auto-deploy!

### Manuell Build

```bash
npm run web:build
```

## 🏔️ Platser

### 🇫🇮 Finska Lappland
- Kilpisjärvi
- Inari
- Rovaniemi
- Enontekiö
- Saariselkä

### 🇸🇪 Svenska Fjällkedjan
- Abisko
- Åre
- Funäsdalen
- Kiruna
- Riksgränsen
- Strömsund

## 🛠️ Teknologier

- React Native
- Expo
- Open-Meteo API (gratis)
- react-native-chart-kit
- AsyncStorage
- expo-location

## 📝 Licens

MIT

## 🙏 Tack till

- [Open-Meteo](https://open-meteo.com/) för gratis väderdata
- Alla långfärdsskridskoåkare! 🧊⛸️
