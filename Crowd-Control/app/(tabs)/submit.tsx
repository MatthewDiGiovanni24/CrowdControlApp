import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LOCATIONS } from '../../constants/mockData';
import { useAuth } from '@/context/AuthContext';
import { useSubmissions, CrowdLevel } from '@/context/SubmissionsContext';

type PredictionResponse = {
  level: CrowdLevel;
};
//NEED TO EDIT TO YOUR DEVICES IP ADDRESS
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.131.16.16:5000';

export default function SubmitScreen() {
  const { user } = useAuth();
  const { addSubmission } = useSubmissions();

  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0] ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setEstimate(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please log in before submitting.');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('No location selected', 'Please choose a location first.');
      return;
    }

    if (!imageUri) {
      Alert.alert('No photo selected', 'Choose a photo before submitting.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'crowd-photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Prediction failed.');
      }

      if (!['Low', 'Medium', 'High'].includes(data?.level)) {
        throw new Error('Invalid prediction response from server.');
      }

      const prediction: PredictionResponse = {
        level: data.level as CrowdLevel,
      };

      addSubmission({
        uid: user.uid,
        username: user.displayName || user.email || 'Anonymous',
        location: selectedLocation,
        createdAt: new Date().toISOString(),
        level: prediction.level,
      });

      setEstimate(prediction);
      setImageUri(null);
    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
      Alert.alert('Upload failed', error?.message || 'Could not process image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Smart crowd estimate</Text>
          <Text style={styles.title}>Submit Crowd Photo</Text>
          <Text style={styles.subtitle}>
            Upload a photo, choose a campus location, and get an instant crowd level estimate.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Signed in as</Text>
          <Text style={styles.infoValue}>{user?.displayName || user?.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Select a location</Text>
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
          <Pressable
            style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
            onPress={choosePhoto}
          >
            <Text style={styles.outlineButtonText}>Choose Photo</Text>
          </Pressable>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

          <Pressable
            style={({ pressed }) => [
              styles.mainButton,
              (loading || !imageUri) && styles.disabledButton,
              pressed && imageUri && !loading && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading || !imageUri}
          >
            <Text style={styles.mainButtonText}>{loading ? 'Processing...' : 'Submit'}</Text>
          </Pressable>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          )}
        </View>

        {estimate && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Estimated Crowd</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Location</Text>
              <Text style={styles.resultValue}>{selectedLocation}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Level</Text>
              <Text style={styles.resultBadge}>{estimate.level}</Text>
            </View>
          </View>
        )}
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
  infoCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8E6FF',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
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
    marginBottom: 20,
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
  mainButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  outlineButton: {
    borderColor: '#2563EB',
    borderWidth: 1.5,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
  },
  outlineButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    marginTop: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  loadingText: {
    color: '#475569',
    fontSize: 14,
  },
  resultCard: {
    marginTop: 22,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});