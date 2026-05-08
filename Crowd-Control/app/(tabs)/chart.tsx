import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LOCATIONS } from '../../constants/mockData';
import { useSubmissions, Submission } from '@/context/SubmissionsContext';

const LEVEL_TO_VALUE: Record<Submission['level'], number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const LEVEL_TO_COLOR: Record<Submission['level'], string> = {
  Low: '#22C55E',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export default function ChartScreen() {
  const { submissions } = useSubmissions();
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0] ?? '');

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((submission) => submission.location === selectedLocation)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [submissions, selectedLocation]);

  const maxValue = 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Trend view</Text>
          <Text style={styles.title}>Crowd Activity Chart</Text>
          <Text style={styles.subtitle}>
            Compare crowd levels over time for each campus location using recent submissions.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Choose a location</Text>
        <View style={styles.locationContainer}>
          {LOCATIONS.map((location) => {
            const active = selectedLocation === location;

            return (
              <Pressable
                key={location}
                onPress={() => setSelectedLocation(location)}
                style={[styles.locationButton, active && styles.locationButtonActive]}
              >
                <Text style={[styles.locationText, active && styles.locationTextActive]}>
                  {location}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardSubtitle}>
            Crowd levels over time for {selectedLocation}
          </Text>

          {filteredSubmissions.length === 0 ? (
            <Text style={styles.emptyText}>No crowd data yet for this location.</Text>
          ) : (
            <View style={styles.chartContainer}>
              {filteredSubmissions.map((item) => {
                const numericValue = LEVEL_TO_VALUE[item.level];
                const barHeight = (numericValue / maxValue) * 180;

                return (
                  <View key={item.id} style={styles.barGroup}>
                    <Text style={styles.valueText}>{item.level}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: LEVEL_TO_COLOR[item.level],
                        },
                      ]}
                    />
                    <Text style={styles.labelText}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  heroBlock: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2563EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  locationButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  locationButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  locationText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  locationTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 18,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 220,
    gap: 10,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 28,
    borderRadius: 10,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});