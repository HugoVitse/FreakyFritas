import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appStyles } from '../styles/appStyles';

interface PermissionScreenProps {
  loading: boolean;
  onRequest: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  loading,
  onRequest,
}) => {
  return (
    <SafeAreaView style={appStyles.container}>
      <View style={appStyles.centered}>
        <Text style={appStyles.title}>
          {loading
            ? "Chargement des permissions..."
            : "Autorisez l'accès à la caméra"}
        </Text>
        {!loading && (
          <TouchableOpacity
            style={appStyles.primaryButton}
            onPress={onRequest}
          >
            <Text style={appStyles.primaryButtonText}>Autoriser</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
