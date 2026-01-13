import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { appStyles } from '../styles/appStyles';
import { DeliveryNote } from '../types';

interface DeliveryModalProps {
  delivery: DeliveryNote;
  labelCounts: Record<string, number>;
  visible: boolean;
  onClose: () => void;
  onValidate: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  delivery,
  labelCounts,
  visible,
  onClose,
  onValidate,
}) => {
  if (!visible) return null;

  return (
    <View style={appStyles.modalOverlay}>
      <View style={appStyles.modal}>
        <View style={appStyles.modalHeader}>
          <Text style={appStyles.modalTitle}>Détail du bon de livraison</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={appStyles.modalCloseButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={appStyles.modalContent}
          contentContainerStyle={appStyles.modalContentInner}
        >
          <View style={appStyles.modalSection}>
            <Text style={appStyles.modalSectionTitle}>Infos générales</Text>
            <Text style={appStyles.modalRow}>
              <Text style={appStyles.modalLabel}>Numéro BL:</Text>{' '}
              {delivery.delivery_note_number ?? '—'}
            </Text>
            <Text style={appStyles.modalRow}>
              <Text style={appStyles.modalLabel}>Date:</Text>{' '}
              {delivery.delivery_date ?? '—'}
            </Text>
          </View>

          <View style={appStyles.modalSection}>
            <Text style={appStyles.modalSectionTitle}>Expéditeur</Text>
            <Text style={appStyles.modalRow}>
              {delivery.shipper_name_address ?? '—'}
            </Text>
            <Text style={appStyles.modalRow}>
              <Text style={appStyles.modalLabel}>SIRET:</Text>{' '}
              {delivery.shipper_siret ?? '—'}
            </Text>
          </View>

          <View style={appStyles.modalSection}>
            <Text style={appStyles.modalSectionTitle}>Destinataire</Text>
            <Text style={appStyles.modalRow}>
              {delivery.recipient_name_address ?? '—'}
            </Text>
            <Text style={appStyles.modalRow}>
              <Text style={appStyles.modalLabel}>SIRET:</Text>{' '}
              {delivery.recipient_siret ?? '—'}
            </Text>
          </View>

          <View style={appStyles.modalSection}>
            <Text style={appStyles.modalSectionTitle}>
              Items ({delivery.items.length})
            </Text>
            {delivery.items.map((item, idx) => {
              const key = (item.product_name ?? '').toUpperCase().trim();
              const scanned = key ? labelCounts[key] ?? 0 : 0;
              const expected = item.quantity ?? 0;
              const isOk = scanned >= expected;
              return (
                <View
                  key={idx}
                  style={[
                    appStyles.modalItem,
                    isOk && appStyles.modalItemOk,
                    !isOk && appStyles.modalItemKo,
                  ]}
                >
                  <View style={appStyles.modalItemHeader}>
                    <View
                      style={[
                        appStyles.badge,
                        isOk ? appStyles.badgeOk : appStyles.badgeKo,
                      ]}
                    />
                    <Text style={appStyles.modalItemName}>
                      {item.product_name ?? 'Produit'}
                    </Text>
                  </View>
                  <Text style={appStyles.modalItemDetail}>
                    Variété: {item.variety ?? '—'}
                  </Text>
                  <Text style={appStyles.modalItemDetail}>
                    Origine: {item.origin ?? '—'}
                  </Text>
                  <Text style={appStyles.modalItemDetail}>
                    Lot: {item.lot ?? '—'}
                  </Text>
                  <Text style={appStyles.modalItemDetail}>
                    Unité: {item.unit ?? '—'}
                  </Text>
                  <Text
                    style={[appStyles.modalItemDetail, { fontWeight: '600' }]}
                  >
                    Scannées: {scanned} / Attendues: {expected}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={appStyles.modalFooter}>
          <TouchableOpacity
            style={[
              appStyles.modalButton,
              appStyles.modalButtonSecondary,
            ]}
            onPress={onClose}
          >
            <Text style={[appStyles.modalButtonText, appStyles.modalButtonSecondaryText]}>Fermer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              appStyles.modalButton,
              appStyles.modalButtonPrimary,
            ]}
            onPress={onValidate}
          >
            <Text style={[appStyles.modalButtonText, { fontWeight: '700' }]}>
              Valider fin de scan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
