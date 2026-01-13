import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { appStyles } from '../styles/appStyles';
import { DeliveryNote } from '../types';
import { getProductKey } from '../utils/data';

interface DeliveryDetailPanelProps {
  delivery: DeliveryNote | null;
  labelCounts: Record<string, number>;
  historyOpen: boolean;
  onToggleHistory: () => void;
  onOpenModal: () => void;
  onDecrement: (productName: string) => void;
  onAddQuantity: (productName: string) => void;
}

export const DeliveryDetailPanel: React.FC<DeliveryDetailPanelProps> = ({
  delivery,
  labelCounts,
  historyOpen,
  onToggleHistory,
  onOpenModal,
  onDecrement,
  onAddQuantity,
}) => {
  if (!delivery) return null;

  return (
    <>
      {!historyOpen && (<>
      <TouchableOpacity
        style={appStyles.deliveryCard}
        onPress={onOpenModal}
      >
        <Text style={appStyles.deliveryTitle}>Bon de livraison courant</Text>
        <Text style={appStyles.deliveryMeta}>
          {delivery.delivery_note_number ?? 'BL sans numéro'}
        </Text>
        <Text style={appStyles.deliveryMeta}>
          {delivery.shipper_name_address ?? 'Expéditeur inconnu'}
        </Text>
        <Text style={appStyles.deliveryMeta}>
          {delivery.recipient_name_address ?? 'Destinataire inconnu'}
        </Text>
        {delivery.items.slice(0, 4).map((it, idx) => (
          <Text key={idx} style={appStyles.deliveryItem}>
            - {it.product_name || 'Produit'} : {it.quantity ?? '?'}{' '}
            {it.unit ?? ''}
          </Text>
        ))}
        {delivery.items.length > 4 && (
          <Text style={appStyles.deliveryMeta}>
            + {delivery.items.length - 4} lignes supplémentaires…
          </Text>
        )}
        <Text
          style={{
            marginTop: 8,
            fontStyle: 'italic',
            color: '#9ca3af',
            fontSize: 12,
          }}
        >
          👆 Appuyez pour voir en détail
        </Text>
      </TouchableOpacity>

      <View style={appStyles.row}>
        <Text style={appStyles.label}>
          Livraison : {delivery.delivery_note_number ?? 'BL sans numéro'}
        </Text>
        <TouchableOpacity onPress={onToggleHistory}>
          <Text style={appStyles.link}>
            {historyOpen ? 'Réduire' : 'Voir items'}
          </Text>
        </TouchableOpacity>
      </View>
      </>)}

      {historyOpen && (
        <View style={appStyles.historyBox}>
          <Text style={appStyles.historyTitle}>Items à scanner</Text>
          <ScrollView
            style={appStyles.historyList}
            contentContainerStyle={appStyles.historyContent}
          >
            {delivery.items.map((item, idx) => {
              const key = getProductKey(item.product_name);
              const scanned = key ? labelCounts[key] ?? 0 : 0;
              const expected = item.quantity ?? 0;
              const isOk = scanned >= expected;
              return (
                <View key={idx} style={appStyles.historyItem}>
                  <View style={appStyles.historyHeader}>
                    <View
                      style={[
                        appStyles.badge,
                        isOk ? appStyles.badgeOk : appStyles.badgeKo,
                      ]}
                    />
                    <Text style={appStyles.historyProduct}>
                      {item.product_name ?? 'Produit'}
                    </Text>
                  </View>
                  <Text style={appStyles.historyMeta}>
                    Variété: {item.variety ?? '—'} • Origine:{' '}
                    {item.origin ?? '—'}
                  </Text>
                  <Text style={appStyles.historyMeta}>
                    Lot: {item.lot ?? '—'} • Unité: {item.unit ?? ''}
                  </Text>
                  <View style={appStyles.quantityRow}>
                    <Text
                      style={[
                        appStyles.historyMeta,
                        isOk ? { color: '#22c55e' } : { color: '#ef4444' },
                      ]}
                    >
                      Scannées: {scanned} / Attendues: {expected}
                    </Text>
                    {key && (
                      <View style={appStyles.quantityControls}>
                        <TouchableOpacity
                          style={[
                            appStyles.quantityButton,
                            appStyles.quantityButtonSmall,
                          ]}
                          onPress={() => onDecrement(key)}
                        >
                          <Text style={appStyles.quantityButtonText}>−</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            appStyles.quantityButton,
                            appStyles.quantityButtonSmall,
                          ]}
                          onPress={() => onAddQuantity(item.product_name!)}
                        >
                          <Text style={appStyles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </>
  );
};
