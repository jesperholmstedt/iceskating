import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { PRESET_LOCATIONS } from '../data/locations';
import { evaluateLocationsInRadius } from '../services/weatherService';
import { useTranslation } from '../i18n';

export default function NearbyFinder({ selectedLocation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const FIXED_RADIUS_KM = 200;

  useEffect(() => {
    if (!selectedLocation) return;

    let mounted = true;
    (async () => {
      setError(null);
      setResults([]);
      setVisibleResults([]);
      setSearched(true);
      setLoading(true);
      try {
        const res = await evaluateLocationsInRadius(
          selectedLocation.latitude,
          selectedLocation.longitude,
          FIXED_RADIUS_KM,
          PRESET_LOCATIONS,
          { concurrency: 4 }
        );
        if (!mounted) return;
        setResults(res || []);
        const minScore = 0.4;
        const visible = (res || []).filter(x => typeof x.score === 'number' && x.score >= minScore);
        setVisibleResults(visible);
      } catch (err) {
        console.error('NearbyFinder error', err);
        if (!mounted) return;
        setError(t('nearbyFinderError') || 'Kunde inte söka platser — försök igen');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [selectedLocation, t]);

  return (
    <View style={styles.container}>
      <View style={styles.finderHeaderRow}>
        <Text style={styles.finderTitle}>{t('nearbyFinderTitle') || 'Sök möjliga isplatser'}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.centerBox}>
          <Text style={styles.centerLabel}>{t('center') || 'Center'}</Text>
          <Text style={styles.centerName}>{selectedLocation?.name}</Text>
          <Text style={styles.centerRegion}>{selectedLocation?.region}</Text>
          <View style={styles.radiusInline}>
            <Text style={styles.centerLabel}>{t('radiusKm') || 'Radie (km)'}</Text>
            <Text style={styles.radiusValue}>{`${FIXED_RADIUS_KM} km`}</Text>
          </View>
        </View>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingText}>{t('loading') || 'Söker...'}</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && searched && results.length === 0 && !error && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>{t('noIceFound') || 'Ingen möjlig is hittades inom vald radie.'}</Text>
        </View>
      )}

      {!loading && searched && results.length > 0 && visibleResults.length === 0 && !error && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>{t('noSuitableResultsIntro') || 'Inga platser med etiketten "Möjlig" eller högre hittades inom vald radie.'}</Text>
          {results[0] && (
            <Text style={[styles.noResultsText, { marginTop: 8 }]}> 
              {`${t('highestScoreWas') || 'Högsta poäng var'} ${Math.round(results[0].score * 100)}% — ${results[0].name}`}
            </Text>
          )}

          <View style={styles.readMoreArea}>
            <TouchableOpacity onPress={() => setShowTooltip(s => !s)}>
              <Text style={styles.readMoreLink}>{t('nearbyFinderReadMore') || 'Läs mer om hur poängen räknas'}</Text>
            </TouchableOpacity>
            {showTooltip && (
              <View style={styles.tooltipBoxBelow}>
                <Text style={styles.tooltipTitle}>{t('nearbyFinderTooltipTitle') || 'Hur poängen beräknas'}</Text>
                <Text style={styles.tooltipText}>{t('nearbyFinderTooltipText') || 'Poängen baseras på historiska och prognostiserade vädersignaler.'}</Text>
                <TouchableOpacity onPress={() => setShowTooltip(false)} style={styles.tooltipCloseButton}>
                  <Text style={styles.tooltipCloseText}>{t('close') || 'Stäng'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {!loading && visibleResults.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>{t('results') || 'Resultat'}</Text>
          <FlatList
            data={visibleResults}
            keyExtractor={(item) => `${item.name}-${item.latitude}-${item.longitude}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultRow} onPress={() => { /* intentionally no-op: selection handled elsewhere */ }}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{item.name} — <Text style={styles.resultRegion}>{item.region}</Text></Text>
                  <Text style={styles.resultScore}>{Math.round(item.score * 100)}%</Text>
                </View>
                <Text style={styles.resultLabel}>{item.label} · {item.distanceKm} km</Text>
                {item.reasons && item.reasons.map((r, idx) => (
                  <Text key={idx} style={styles.reason}>• {r}</Text>
                ))}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  finderTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#1f618d' },
  finderHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  readMoreWrapper: { marginLeft: 12 },
  readMoreLink: { color: '#3498db', fontWeight: '700' },
  tooltipBox: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginTop: 8 },
  tooltipTitle: { fontWeight: '700', marginBottom: 6 },
  tooltipText: { color: '#34495e', lineHeight: 18 },
  tooltipCloseButton: { marginTop: 8, alignSelf: 'flex-end' },
  tooltipCloseText: { color: '#3498db', fontWeight: '700' },
  readMoreArea: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  tooltipBoxBelow: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  centerBox: { flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 8 },
  centerLabel: { fontSize: 12, color: '#7f8c8d' },
  centerName: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  centerRegion: { fontSize: 12, color: '#95a5a6' },
  radiusInline: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radiusValue: { fontWeight: '700' },
  changeButton: { marginLeft: 8, padding: 10, backgroundColor: '#3498db', borderRadius: 8 },
  changeButtonText: { color: '#fff', fontWeight: '700' },
  picker: { maxHeight: 200, marginTop: 8, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  presetItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  presetText: { color: '#333' },
  controls: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  label: { marginRight: 8, color: '#7f8c8d' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 8, borderRadius: 8, width: 90, marginRight: 12, backgroundColor: '#fff' },
  findButton: { backgroundColor: '#27ae60', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  findButtonText: { color: '#fff', fontWeight: '700' },
  loading: { marginTop: 12, alignItems: 'center' },
  loadingText: { marginTop: 6, color: '#7f8c8d' },
  errorText: { color: '#c0392b', marginTop: 8 },
  results: { marginTop: 12 },
  resultsTitle: { fontWeight: '700', marginBottom: 6 },
  noResults: { marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8 },
  noResultsText: { color: '#7f8c8d' },
  resultRow: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontWeight: '700' },
  resultRegion: { fontWeight: '400', color: '#666' },
  resultScore: { fontWeight: '700', color: '#0b6fa4' },
  resultLabel: { marginTop: 4, color: '#7f8c8d' },
  reason: { marginTop: 4, color: '#34495e' },
});
