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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  let maxFreezing = 0;
  let hasThawing = false;
  let totalSnowfall = 0;
  let pastSnowfall = 0;
  let futureSnowfall = 0;
  let freezingDaysHistory = [];
  let freezingDaysInLast7Days = 0;

  console.log('=== ICE CONDITIONS ANALYSIS ===');
  console.log(`Analyzing ${weatherData.length} days of weather data`);
  console.log(`Today: ${today.toISOString().split('T')[0]}`);

  // Filter to only past days (including today)
  const pastDays = weatherData.filter(day => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate <= today;
  });

  console.log(`Found ${pastDays.length} past days (including today)`);

  // Get last 7 days from past days
  const last7Days = pastDays.slice(-7);
  console.log(`Analyzing last 7 days: ${last7Days.map(d => d.date).join(', ')}`);

  // Count freezing days in last 7 days
  last7Days.forEach(day => {
    const isFreezingDay = day.tempMax < 0;
    if (isFreezingDay) {
      freezingDaysInLast7Days++;
    }
    console.log(`${day.date}: Max=${day.tempMax}°C, Freezing=${isFreezingDay}`);
  });

  console.log(`Freezing days in last 7 days: ${freezingDaysInLast7Days}`);

  // Continue with full analysis for other metrics
  weatherData.forEach((day, index) => {
    const date = new Date(day.date);
    const isFreezingDay = day.tempMax < 0;
    const isPastDay = date <= today;

    console.log(`${date.toISOString().split('T')[0]}: Max=${day.tempMax}°C, Min=${day.tempMin}°C, Freezing=${isFreezingDay}, Past=${isPastDay}`);

    // Track freezing days for history
    freezingDaysHistory.push({
      date: day.date,
      tempMax: day.tempMax,
      tempMin: day.tempMin,
      isFreezingDay: isFreezingDay,
      consecutiveFreezing: 0 // Will be calculated below if needed
    });

    // Check for thawing (day temp above 0°C)
    if (day.tempMax > 0) {
      hasThawing = true;
    }

    // Sum up snowfall
    const snowfall = day.snowfall || 0;
    totalSnowfall += snowfall;
    
    if (isPastDay) {
      pastSnowfall += snowfall;
    } else {
      futureSnowfall += snowfall;
    }
  });

  console.log(`Total snowfall: ${totalSnowfall.toFixed(1)} cm`);
  console.log(`Past snowfall (last 5 days): ${pastSnowfall.toFixed(1)} cm`);
  console.log(`Future snowfall (next 5 days): ${futureSnowfall.toFixed(1)} cm`);
  console.log(`Has thawing occurred: ${hasThawing}`);

  // Show last 14 days (2 weeks) of freezing data
  console.log('\n=== LAST 14 DAYS FREEZING HISTORY ===');
  const last14Days = freezingDaysHistory.slice(-14);
  last14Days.forEach(day => {
    const date = new Date(day.date);
    console.log(`${date.toISOString().split('T')[0]}: ${day.isFreezingDay ? 'FREEZING' : 'NOT FREEZING'} (${day.tempMax}°C max)`);
  });

  console.log('=== END ANALYSIS ===\n');

  // Simple ice condition assessment
  let condition = 'unknown';
  let message = '';

  if (freezingDaysInLast7Days >= 5 && !hasThawing && totalSnowfall < 5) {
    condition = 'excellent';
    message = 'Utmärkta förhållanden! Majoriteten av de senaste 7 dagarna har haft frysning, ingen tö, ingen eller lite snö.';
  } else if (freezingDaysInLast7Days >= 3 && totalSnowfall < 10) {
    condition = 'good';
    message = 'Bra förhållanden för skridskoåkning.';
  } else if (hasThawing || totalSnowfall > 15) {
    condition = 'poor';
    message = 'Möjligen dåliga förhållanden.';
  } else {
    condition = 'moderate';
    message = 'Måttliga förhållanden. Kontrollera lokalt.';
  }

  return {
    condition,
    message,
    maxConsecutiveFreezingDays: freezingDaysInLast7Days,
    hasThawing,
    totalSnowfall,
    pastSnowfall,
    futureSnowfall,
  };
}
