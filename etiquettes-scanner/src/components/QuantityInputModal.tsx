import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { appStyles } from '../styles/appStyles';

interface QuantityInputModalProps {
  visible: boolean;
  productName: string | null;
  quantity: string;
  onQuantityChange: (quantity: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QuantityInputModal: React.FC<QuantityInputModalProps> = ({
  visible,
  productName,
  quantity,
  onQuantityChange,
  onConfirm,
  onCancel,
}) => {
  if (!visible || !productName) return null;

  return (
    <View style={appStyles.quantityInputModal}>
      <View style={appStyles.quantityInputBox}>
        <Text style={appStyles.quantityInputTitle}>
          Quantité pour {productName}
        </Text>
        <View>
          <Text style={appStyles.quantityInputLabel}>
            Entrez le nombre de colis scannés :
          </Text>
          <TextInput
            style={appStyles.quantityInputField}
            keyboardType="number-pad"
            placeholder="Ex: 20"
            placeholderTextColor="#6b7280"
            value={quantity}
            onChangeText={onQuantityChange}
            autoFocus
          />
        </View>
        <View style={appStyles.quantityInputButtons}>
          <TouchableOpacity
            style={[
              appStyles.quantityInputButton,
              appStyles.quantityInputButtonCancel,
            ]}
            onPress={onCancel}
          >
            <Text style={[appStyles.quantityInputButtonText, appStyles.quantityInputButtonCancelText]}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              appStyles.quantityInputButton,
              appStyles.quantityInputButtonConfirm,
            ]}
            onPress={onConfirm}
          >
            <Text style={appStyles.quantityInputButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
