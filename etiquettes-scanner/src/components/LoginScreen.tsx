import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { appStyles } from '../styles/appStyles';
import { loginUser } from '../utils/api';

const colors = {
  primary: '#7c3aed',
  background: '#ffffff',
  surfaceLight: '#f3f3f5',
  textDark: '#030213',
  textLight: '#717182',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
};

interface LoginScreenProps {
  onLogin: (email: string, domain: string) => void;
  onBack: () => void;
  onSignUp?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onBack,
  onSignUp,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginUser(email);
      onLogin(result.email, result.domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de se connecter. Vérifiez votre connexion Internet.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>�</Text>
          </View>
          <Text style={appStyles.homeTitle}>Connexion</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse email pour vous connecter
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              style={styles.input}
              placeholder="vous@example.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase());
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoComplete="email"
            />
            {email && (
              <Text style={styles.domainHint}>
                Domaine: <Text style={styles.domainValue}>{email.split('@')[1] || '...'}</Text>
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              appStyles.homeButton,
              (!isValidEmail(email) || loading) && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isValidEmail(email) || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={appStyles.homeButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Links */}
        <View style={styles.footerContainer}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backLink}>← Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: appStyles.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: appStyles.textDark,
  },
  domainHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  domainValue: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  backLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
