/**
 * Welcome / auth screen — toggles between signup and login forms.
 * This is the entry point for unauthenticated users.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/common/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { isValidEmail, isValidPassword } from '../../src/utils/validators';
import { Colors, Gradients } from '../../src/constants/colors';

export default function OnboardingScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { signup, login, isLoading, error } = useAuth();

  const handleSubmit = () => {
    setFormError(null);
    if (!isValidEmail(email)) {
      setFormError('Enter a valid email address');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (mode === 'signup') {
      signup({ email, password, full_name: fullName || undefined });
    } else {
      login({ email, password });
    }
  };

  return (
    <LinearGradient colors={Gradients.backgroundRadial} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>ASTROVIA</Text>
          <Text style={styles.tagline}>Your palm. Your stars. Your story.</Text>

          <View style={styles.form}>
            {mode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {(formError || error) && <Text style={styles.errorText}>{formError || error}</Text>}

            <Button
              label={mode === 'signup' ? 'Create Account' : 'Log In'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />

            <Text style={styles.switchText} onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 60 },
  logo: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 48,
  },
  form: { gap: 14 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  submitButton: { marginTop: 8 },
  switchText: {
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});