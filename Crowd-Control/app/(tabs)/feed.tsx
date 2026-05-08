import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { LOCATIONS } from '../../constants/mockData';
import { useSubmissions, Submission } from '@/context/SubmissionsContext';

function getLevelStyle(level: Submission['level']) {
  switch (level) {
    case 'Low':
      return { backgroundColor: '#DCFCE7', color: '#166534' };
    case 'Medium':
      return { backgroundColor: '#FEF3C7', color: '#92400E' };
    case 'High':
      return { backgroundColor: '#FEE2E2', color: '#991B1B' };
    default:
      return { backgroundColor: '#E5E7EB', color: '#374151' };
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export default function FeedScreen() {
  const { user, logOut } = useAuth();
  const { submissions } = useSubmissions();
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0] ?? '');

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((submission) => submission.location === selectedLocation)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [submissions, selectedLocation]);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error: any) {
      Alert.alert('Logout failed', error?.message || 'Could not log out.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Live updates</Text>
          <Text style={styles.title}>Recent Submissions</Text>
          <Text style={styles.subtitle}>
            View the latest crowd reports by location and see how busy each area is right now.
          </Text>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountLabel}>Signed in as</Text>
          <Text style={styles.accountValue}>{user?.displayName || user?.email}</Text>
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

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{selectedLocation}</Text>
          <Text style={styles.summaryText}>
            {filteredSubmissions.length} recent submission
            {filteredSubmissions.length === 1 ? '' : 's'}
          </Text>
        </View>

        {filteredSubmissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No submissions yet</Text>
            <Text style={styles.emptyText}>
              Submit a crowd photo for this location to start the live feed.
            </Text>
          </View>
        ) : (
          filteredSubmissions.map((submission) => {
            const levelStyle = getLevelStyle(submission.level);

            return (
              <View key={submission.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardLocation}>{submission.location}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelStyle.backgroundColor }]}>
                    <Text style={[styles.levelText, { color: levelStyle.color }]}>
                      {submission.level}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>Submitted by {submission.username}</Text>
                <Text style={styles.cardMeta}>{formatDate(submission.createdAt)}</Text>
              </View>
            );
          })
        )}

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
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
  accountCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8E6FF',
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 15,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  levelBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});