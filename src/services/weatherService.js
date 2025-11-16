/**
 * Weather API Service
 * Uses Open-Meteo API to fetch historical and forecast weather data
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Simple in-memory cache for evaluation results to improve UX when repeated queries
const evaluationCache = new Map();

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
  let freezingDaysInLast5Days = 0;
  let freezingNoSnowDays = 0;

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

  // Get last 5 days from past days
  const last5Days = pastDays.slice(-5);
  console.log(`Analyzing last 5 days: ${last5Days.map(d => d.date).join(', ')}`);

  // Count freezing days in last 5 days (use MIN temperature < 0°C)
  last5Days.forEach(day => {
    const isFreezingDay = day.tempMin < 0;
    if (isFreezingDay) {
      freezingDaysInLast5Days++;
    }
    // Count days with freezing temps AND no snowfall
    const snowfall = day.snowfall || 0;
    if (isFreezingDay && snowfall === 0) {
      freezingNoSnowDays++;
    }
    console.log(`${day.date}: Min=${day.tempMin}°C, Freezing=${isFreezingDay}`);
  });

  console.log(`Freezing days in last 5 days: ${freezingDaysInLast5Days}`);

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

  // Return factual analysis data only (no qualitative assessment)
  return {
    maxConsecutiveFreezingDays: freezingDaysInLast5Days,
    freezingNoSnowDays,
    totalSnowfall,
    pastSnowfall,
    futureSnowfall,
    freezingDaysHistory,
  };
}

/**
 * Evaluate ice potential score for a single location using past and forecast data.
 * Returns score (0..1), human label and reasons for the score plus computed metrics.
 */
export async function evaluateIcePotentialForLocation(latitude, longitude, options = {}) {
  const pastDays = options.pastDays ?? 14; // look back up to 14 days
  const forecastDays = options.forecastDays ?? 5;

  const cacheTTLMinutes = options.cacheTTLMinutes ?? 10; // default cache time-to-live
  const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${pastDays}_${forecastDays}`;
  const now = Date.now();
  if (!options.disableCache) {
    if (evaluationCache.has(cacheKey)) {
      const entry = evaluationCache.get(cacheKey);
      if (now - entry.ts < cacheTTLMinutes * 60_000) {
        return entry.value;
      }
    }
  }

  // Scoring weights (can be overridden via options.weights)
  const defaultWeights = {
    baseline: 0.1,
    perPastFreezingNoSnowDay: 0.15,
    pastCap: 0.6,
    perForecastColdNoSnowDay: 0.15,
    forecastCap: 0.45,
    // Make snowfall penalties less harsh by default so small amounts of snow
    // don't overly reduce the ice potential score. These can still be
    // overridden via options.weights when tuning is needed.
    recentSnowDivisor: 40, // larger divisor -> smaller subtraction per cm
    recentSnowCap: 0.45,   // lower cap for recent snow penalty
    forecastSnowDivisor: 20,
    forecastSnowCap: 0.3,
    coldWhileSnowPenalty: 0.1,
    monthFactors: { 2: 0.85, 3: 0.85, 11: 0.95 }
  };
  const weights = { ...defaultWeights, ...(options.weights || {}) };

  // Fetch weather data (will throw on error)
  const raw = await fetchWeatherData(latitude, longitude, pastDays, forecastDays);
  const data = raw.data || [];

  // Metrics
  const today = new Date();
  today.setHours(0,0,0,0);

  // Split past and future
  const past = data.filter(d => new Date(d.date) <= today);
  const future = data.filter(d => new Date(d.date) > today);

  // Helper sums
  const sum = (arr, fn) => arr.reduce((s, x) => s + (fn(x) || 0), 0);

  // pastFreezingNoSnowDays: count in last 5 days (or configurable)
  const lookBack = options.lookBackDays ?? 5;
  const lastNDays = past.slice(-lookBack);
  const pastFreezingNoSnowDays = lastNDays.filter(d => (typeof d.tempMin === 'number' && d.tempMin < 0) && ((d.snowfall || 0) === 0)).length;

  // recentSnowDepth (last 7 days by default)
  const snowWindow = options.snowWindowDays ?? 7;
  const recentSnow = past.slice(-snowWindow);
  const recentSnowDepth = sum(recentSnow, d => d.snowfall || 0);

  // forecast metrics
  const forecastColdNoSnowDays = future.filter(d => (typeof d.tempMin === 'number' && d.tempMin < 0) && ((d.snowfall || 0) === 0)).length;
  const forecastSnowDays = future.filter(d => (d.snowfall || 0) > 0.1).length;
  const forecastSnowTotal = sum(future, d => d.snowfall || 0);

  // Detect if there was cold while it snowed recently (indicates snow on ice)
  // Find any contiguous block in recent past where snowfall > 0 and tempMin < 0 for those days
  let consecutiveColdWhileSnow = false;
  for (let i = recentSnow.length - 1; i >= 0; i--) {
    const d = recentSnow[i];
    if ((d.snowfall || 0) > 0 && (typeof d.tempMin === 'number' && d.tempMin < 0)) {
      // if we find at least one such day and a previous cold stretch, mark true
      consecutiveColdWhileSnow = true;
      break;
    }
  }

  // Seasonal adjustment: month-based
  const month = today.getMonth() + 1; // 1..12
  let monthFactor = 1.0;
  if (month === 2 || month === 3) monthFactor = 0.85; // late winter penalty (old snow likely)
  if (month === 11) monthFactor = 0.95; // early season slight penalty

  // Scoring algorithm (heuristic)
  let score = weights.baseline; // baseline

  // Past freezing no-snow days are good
  score += Math.min(weights.pastCap, pastFreezingNoSnowDays * weights.perPastFreezingNoSnowDay);

  // Forecast cold no-snow days are good
  score += Math.min(weights.forecastCap, forecastColdNoSnowDays * weights.perForecastColdNoSnowDay);

  // Subtract for recent snow depth (proportional)
  score -= Math.min(weights.recentSnowCap, recentSnowDepth / weights.recentSnowDivisor);

  // Subtract forecast snow
  score -= Math.min(weights.forecastSnowCap, forecastSnowTotal / weights.forecastSnowDivisor);

  // Subtract if there was cold while it snowed (snow likely stayed atop ice)
  if (consecutiveColdWhileSnow) score -= weights.coldWhileSnowPenalty;

  // Apply month factor
  score = score * monthFactor;

  // Clamp
  score = Math.max(0, Math.min(1, score));

  // Label
  let label = 'Låg sannolikhet';
  if (score >= 0.75) label = 'Hög sannolikhet';
  else if (score >= 0.4) label = 'Möjlig';

  // Reasons (human readable)
  const reasons = [];
  if (pastFreezingNoSnowDays > 0) reasons.push(`${pastFreezingNoSnowDays} dagar med minusgrader utan snö senaste ${lookBack} dagarna`);
  if (recentSnowDepth > 0) reasons.push(`Senaste ${snowWindow} dagarna snö: ${recentSnowDepth.toFixed(1)} cm`);
  if (forecastSnowTotal > 0) reasons.push(`Prognos snö: ${forecastSnowTotal.toFixed(1)} cm kommande ${forecastDays} dagar`);
  if (forecastColdNoSnowDays > 0) reasons.push(`${forecastColdNoSnowDays} kalla prognosdagar utan snö`);
  if (consecutiveColdWhileSnow) reasons.push('Nyligen snöade det under kalla förhållanden — snö kan ligga på isen');

  const resultObj = {
    score,
    label,
    reasons,
    metrics: {
      pastFreezingNoSnowDays,
      recentSnowDepth,
      forecastColdNoSnowDays,
      forecastSnowDays,
      forecastSnowTotal,
      month,
      monthFactor,
    },
    rawData: data,
  };

  // store in cache
  try {
    evaluationCache.set(cacheKey, { ts: now, value: resultObj });
  } catch (e) {
    // ignore cache failures
  }

  return resultObj;
}

/**
 * Evaluate ice potential for a list of locations within a radius around center.
 * locations is an array of objects { name, latitude, longitude, region }
 */
export async function evaluateLocationsInRadius(centerLat, centerLon, radiusKm, locations, options = {}) {
  // Haversine distance
  const toRad = deg => deg * Math.PI / 180;
  function distanceKm(aLat, aLon, bLat, bLon) {
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLon = toRad(bLon - aLon);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Filter locations within radius
  const within = locations.filter(loc => {
    const d = distanceKm(centerLat, centerLon, loc.latitude, loc.longitude);
    return d <= radiusKm;
  });

  // Concurrency limit
  const concurrency = options.concurrency ?? 4;
  const results = [];
  for (let i = 0; i < within.length; i += concurrency) {
    const chunk = within.slice(i, i + concurrency);
    const promises = chunk.map(loc => evaluateIcePotentialForLocation(loc.latitude, loc.longitude, options)
      .then(res => ({ loc, res }))
      .catch(err => ({ loc, err })));
    // wait for batch
    // eslint-disable-next-line no-await-in-loop
    const batch = await Promise.all(promises);
    results.push(...batch);
  }

  // Map to a nicer list and sort by score desc
  const mapped = results.map(r => {
    if (r.err) return { name: r.loc.name, region: r.loc.region, latitude: r.loc.latitude, longitude: r.loc.longitude, error: true };
    const dist = distanceKm(centerLat, centerLon, r.loc.latitude, r.loc.longitude);
    return {
      name: r.loc.name,
      region: r.loc.region,
      latitude: r.loc.latitude,
      longitude: r.loc.longitude,
      distanceKm: Number(dist.toFixed(2)),
      score: r.res.score,
      label: r.res.label,
      reasons: r.res.reasons,
      metrics: r.res.metrics,
    };
  }).filter(x => !x.error).sort((a,b) => b.score - a.score);

  return mapped;
}
