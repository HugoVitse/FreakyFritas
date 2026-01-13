import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appStyles } from '../styles/appStyles';

interface HomeScreenProps {
  productCount: number;
  totalColis: number;
  onStartNewDelivery: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  productCount,
  totalColis,
  onStartNewDelivery,
}) => {
  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="light-content" />
      <View style={appStyles.homeScreen}>
        <View style={appStyles.homeContent}>
          <Text style={appStyles.homeTitle}>📦 Gestion Livraisons</Text>
          <Text style={appStyles.homeSubtitle}>
            Scanneur d'étiquettes & Bon de livraison
          </Text>

          <View style={appStyles.homeStats}>
            <View style={appStyles.statCard}>
              <Text style={appStyles.statValue}>{productCount}</Text>
              <Text style={appStyles.statLabel}>Produits différents</Text>
            </View>
            <View style={appStyles.statCard}>
              <Text style={appStyles.statValue}>{totalColis}</Text>
              <Text style={appStyles.statLabel}>Colis total</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={appStyles.homeButton}
          onPress={onStartNewDelivery}
        >
          <Text style={appStyles.homeButtonText}>🚀 Nouvelle Livraison</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
