const { evaluateIcePotentialForLocation, evaluateLocationsInRadius } = require('../src/services/weatherService');

// Helper to build a fake raw Open-Meteo response body compatible with parseWeatherData
function buildRawData(pastDays, forecastDays, pastTemps, pastMins, pastSnow, futureTemps, futureMins, futureSnow) {
  const total = pastDays + forecastDays;
  const today = new Date();
  today.setHours(0,0,0,0);
  const daily_time = [];
  const temperature_2m_max = [];
  const temperature_2m_min = [];
  const precipitation_sum = [];
  const snowfall_sum = [];

  // Build past days first (oldest first)
  for (let i = pastDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    daily_time.push(d.toISOString().split('T')[0]);
  }
  // future days
  for (let i = 1; i <= forecastDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    daily_time.push(d.toISOString().split('T')[0]);
  }

  // fill arrays
  const fillVals = (arr, defaultVal) => {
    const out = [];
    for (let i = 0; i < total; i++) out.push(defaultVal);
    return out;
  };

  const maxs = fillVals(null, 0);
  const mins = fillVals(null, 0);
  const snows = fillVals(null, 0);

  // Copy provided values into the end of arrays
  // past arrays align to the first pastDays entries
  for (let i = 0; i < pastDays; i++) {
    maxs[i] = pastTemps && pastTemps[i] != null ? pastTemps[i] : 0;
    mins[i] = pastMins && pastMins[i] != null ? pastMins[i] : 0;
    snows[i] = pastSnow && pastSnow[i] != null ? pastSnow[i] : 0;
  }

  // future
  for (let i = 0; i < forecastDays; i++) {
    const idx = pastDays + i;
    maxs[idx] = futureTemps && futureTemps[i] != null ? futureTemps[i] : 0;
    mins[idx] = futureMins && futureMins[i] != null ? futureMins[i] : 0;
    snows[idx] = futureSnow && futureSnow[i] != null ? futureSnow[i] : 0;
  }

  return {
    daily: {
      time: daily_time,
      temperature_2m_max: maxs,
      temperature_2m_min: mins,
      precipitation_sum: fillVals(null, 0),
      snowfall_sum: snows,
    },
    hourly: {
      time: [],
      wind_speed_10m: []
    },
    timezone: 'UTC'
  };
}

describe('evaluateIcePotentialForLocation', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
  });

  test('high score when several recent freezing days without snow and cold forecast', async () => {
    // 5 past days all min < 0, no snow; 2 future cold no snow
    const pastDays = 5;
    const forecastDays = 2;
    const pastTemps = [ -2, -1.5, -3, -2.2, -1 ];
    const pastMins = [ -6, -5, -7, -4, -3 ];
    const pastSnow = [0,0,0,0,0];
    const futureTemps = [-2, -1.2];
    const futureMins = [-6, -3.5];
    const futureSnow = [0, 0];

    const raw = buildRawData(pastDays, forecastDays, pastTemps, pastMins, pastSnow, futureTemps, futureMins, futureSnow);

    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(raw) }));

  const res = await evaluateIcePotentialForLocation(60.0, 18.0, { pastDays: pastDays, forecastDays: forecastDays, disableCache: true });

    expect(res).toBeDefined();
    expect(typeof res.score).toBe('number');
    // Expect a reasonably high score due to multiple freezing no-snow days
    expect(res.score).toBeGreaterThan(0.5);
  }, 10000);

  test('lower score when recent snow present even with cold temps', async () => {
    const pastDays = 5;
    const forecastDays = 2;
    const pastTemps = [ -2, -1.5, -3, -2.2, -1 ];
    const pastMins = [ -6, -5, -7, -4, -3 ];
    const pastSnow = [2.0, 1.5, 0.5, 0, 0]; // recent snow exists
    const futureTemps = [-2, -1];
    const futureMins = [-6, -3.5];
    const futureSnow = [0, 0];

    const raw = buildRawData(pastDays, forecastDays, pastTemps, pastMins, pastSnow, futureTemps, futureMins, futureSnow);

    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(raw) }));

  const res = await evaluateIcePotentialForLocation(60.0, 18.0, { pastDays: pastDays, forecastDays: forecastDays, disableCache: true });

    expect(res).toBeDefined();
    expect(typeof res.score).toBe('number');
    // Snow reduces the score; expect lower than the previous scenario threshold
    expect(res.score).toBeLessThan(0.6);
  }, 10000);
});

describe('evaluateLocationsInRadius', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
  });

  test('evaluates multiple locations and returns sorted results', async () => {
    // Build small dataset with two locations; mock fetch to return simple cold no-snow raw data
    const pastDays = 5;
    const forecastDays = 2;
    const raw = buildRawData(pastDays, forecastDays, [-1,-1,-1,-1,-1], [-3,-3,-3,-3,-3], [0,0,0,0,0], [-1,-1], [-3,-3], [0,0]);
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(raw) }));

    const locations = [
      { id: 'a', name: 'A', latitude: 60.0, longitude: 18.0, region: 'X' },
      { id: 'b', name: 'B', latitude: 60.1, longitude: 18.1, region: 'Y' }
    ];

  const results = await evaluateLocationsInRadius(60.0, 18.0, 50, locations, { pastDays, forecastDays, concurrency: 2, disableCache: true });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    // Results should be sorted descending by score
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  }, 15000);
});
