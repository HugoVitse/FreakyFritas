import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';

interface LandingScreenProps {
  onLogin: () => void;
}

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onLogin
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo et titre */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>📦</Text>
          </View>
          <Text style={styles.title}>Gestion Livraisons</Text>
          <Text style={styles.subtitle}>
            Scanneur d'étiquettes et bon de livraison pour fruits & légumes
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>
            À propos de Gestion Livraisons
          </Text>

          <Text style={styles.descriptionText}>
            L'application complète pour la gestion des livraisons de fruits et
            légumes frais. Vérifiez la conformité des étiquettes en quelques
            secondes.
          </Text>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="🔍"
              title="Analyse OCR"
              description="Extraction automatique des données d'étiquettes"
            />
            <FeatureCard
              icon="✅"
              title="Conformité"
              description="Vérification réglementaire instantanée"
            />
            <FeatureCard
              icon="⚡"
              title="Rapide"
              description="Gestion complète en quelques secondes"
            />
            <FeatureCard
              icon="📊"
              title="Détaillé"
              description="Rapports complets et précis"
            />
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={onLogin}
          >
            <Text style={styles.buttonSecondaryText}>Se connecter</Text>
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Parfait pour les professionnels de la distribution
          </Text>
          <Text style={styles.footerSubtext}>
            Super U • Lidl • Carrefour • et plus
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  primary: '#7c3aed',
  background: '#ffffff',
  surfaceLight: '#f3f3f5',
  textDark: '#030213',
  textLight: '#717182',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.textDark,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center' as const,
  },
  descriptionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f3f3f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textDark,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center' as const,
  },
});
