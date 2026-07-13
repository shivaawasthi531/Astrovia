/**
 * Captures birth date/time/place. Latitude/longitude are auto-resolved
 * from the place name via OpenStreetMap's free geocoding API — the user
 * never has to know or enter coordinates themselves.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { authService } from '../../src/services/authService';
import { useUserStore } from '../../src/store/userStore';
import { toApiDateString, toApiTimeString } from '../../src/utils/formatters';
import { Colors, Gradients } from '../../src/constants/colors';

async function geocodePlace(place: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`,
      { headers: { 'User-Agent': 'AstroviaApp/1.0' } }
    );
    const data = await response.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export default function BirthDetailsScreen() {
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  const [birthTime, setBirthTime] = useState(new Date());
  const [place, setPlace] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const setUser = useUserStore((s) => s.setUser);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setBirthTime(selectedTime);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!place.trim()) {
      setError('Enter your birth place');
      return;
    }

    setIsLoading(true);
    try {
      // Resolve place name to coordinates automatically
      const coords = await geocodePlace(place.trim());
      if (!coords) {
        setError('Could not find that place. Try a nearby city name.');
        setIsLoading(false);
        return;
      }

      const updatedUser = await authService.updateBirthDetails({
        birth_date: toApiDateString(birthDate),
        birth_time: toApiTimeString(birthTime),
        birth_place: place.trim(),
        birth_latitude: coords.lat,
        birth_longitude: coords.lng,
      });
      setUser(updatedUser);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save birth details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={Gradients.backgroundRadial} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Birth Details</Text>
        <Text style={styles.subtitle}>We use this to generate your accurate Vedic Kundli</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Birth Date</Text>
          <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerButtonText}>
              {birthDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          )}

          <Text style={styles.label}>Birth Time</Text>
          <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.pickerButtonText}>
              {birthTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={birthTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              themeVariant="dark"
            />
          )}

          <Text style={styles.label}>Birth Place</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. New Delhi, India"
            placeholderTextColor={Colors.textMuted}
            value={place}
            onChangeText={setPlace}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button label="Continue" onPress={handleSubmit} loading={isLoading} style={styles.submitButton} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.textPrimary },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 6, marginBottom: 32 },
  form: { gap: 14 },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
  pickerButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pickerButtonText: {
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  errorText: { color: Colors.error, fontFamily: 'Poppins_400Regular', fontSize: 13, textAlign: 'center' },
  submitButton: { marginTop: 12 },
});