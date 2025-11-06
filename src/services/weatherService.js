/**
 * Weather API Service
 * Uses Open-Meteo API to fetch historical and forecast weather data
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch weather data for a location
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} pastDays - Days of historical data (2-5)
 * @param {number} forecastDays - Days of forecast data (typically 5)
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeatherData(latitude, longitude, pastDays = 3, forecastDays = 5) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      past_days: pastDays.toString(),
      forecast_days: forecastDays.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum',
      hourly: 'wind_speed_10m',
      timezone: 'auto',
      wind_speed_unit: 'ms'  // Explicitly request m/s instead of default km/h
    });

    const response = await fetch(`${BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    return parseWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Parse and format weather data for easier consumption
 * @param {Object} rawData - Raw API response
 * @returns {Object} Formatted weather data
 */
function parseWeatherData(rawData) {
  const { daily, hourly, timezone } = rawData;
  
  // Calculate mean and max wind speed for each day from hourly data
  const dailyWindData = {};
  
  if (hourly && hourly.time && hourly.wind_speed_10m) {
    hourly.time.forEach((time, index) => {
      const date = time.split('T')[0]; // Get just the date part (YYYY-MM-DD)
      const hour = time.split('T')[1].substring(0, 5); // Get hour (HH:MM)
      const windSpeed = hourly.wind_speed_10m[index];
      
      if (!dailyWindData[date]) {
        dailyWindData[date] = {
          speeds: [],
          maxSpeed: 0,
          maxSpeedTime: ''
        };
      }
      
      dailyWindData[date].speeds.push(windSpeed);
      
      // Track max wind speed and time
      if (windSpeed > dailyWindData[date].maxSpeed) {
        dailyWindData[date].maxSpeed = windSpeed;
        dailyWindData[date].maxSpeedTime = hour;
      }
    });
    
    // Debug: Log wind data for today
    const today = new Date().toISOString().split('T')[0];
    if (dailyWindData[today]) {
      console.log(`Wind data for ${today}:`, dailyWindData[today]);
      console.log('All speeds:', dailyWindData[today].speeds);
    }
  }
  
  const weatherData = daily.time.map((date, index) => {
    // Get wind data for this day
    let windSpeed = 0;
    let windSpeedTime = '';
    
    if (dailyWindData[date]) {
      windSpeed = dailyWindData[date].maxSpeed;
      windSpeedTime = dailyWindData[date].maxSpeedTime;
      
      // Debug log
      console.log(`Date: ${date}, Max Wind: ${windSpeed} m/s at ${windSpeedTime}`);
    }
    
    return {
      date: date,
      tempMax: daily.temperature_2m_max[index],
      tempMin: daily.temperature_2m_min[index],
      precipitation: daily.precipitation_sum[index],
      windSpeed: windSpeed,
      windSpeedTime: windSpeedTime,
      snowfall: daily.snowfall_sum[index],
    };
  });

  return {
    timezone,
    data: weatherData,
  };
}

/**
 * Analyze ice formation conditions based on weather data
 * @param {Array} weatherData - Array of weather data objects
 * @returns {Object} Ice condition analysis
 */
export function analyzeIceConditions(weatherData) {
  let consecutiveFreezing = 0;
  let maxFreezing = 0;
  let hasThawing = false;
  let totalSnowfall = 0;

  weatherData.forEach((day) => {
    // Check for freezing conditions (night temp below 0°C)
    if (day.tempMin < 0) {
      consecutiveFreezing++;
      maxFreezing = Math.max(maxFreezing, consecutiveFreezing);
    } else {
      consecutiveFreezing = 0;
    }

    // Check for thawing (day temp above 0°C)
    if (day.tempMax > 0) {
      hasThawing = true;
    }

    // Sum up snowfall
    totalSnowfall += day.snowfall || 0;
  });

  // Simple ice condition assessment
  let condition = 'unknown';
  let message = '';

  if (maxFreezing >= 3 && !hasThawing && totalSnowfall < 5) {
    condition = 'excellent';
    message = 'Utmärkta förhållanden! Konsekvent frysning, ingen tö, lite snö.';
  } else if (maxFreezing >= 2 && totalSnowfall < 10) {
    condition = 'good';
    message = 'Bra förhållanden för skridskoåkning.';
  } else if (hasThawing || totalSnowfall > 15) {
    condition = 'poor';
    message = 'Dåliga förhållanden. Risk för tö eller mycket snö.';
  } else {
    condition = 'moderate';
    message = 'Måttliga förhållanden. Kontrollera lokalt.';
  }

  return {
    condition,
    message,
    maxConsecutiveFreezingDays: maxFreezing,
    hasThawing,
    totalSnowfall,
  };
}
