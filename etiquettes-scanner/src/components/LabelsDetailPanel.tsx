import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { appStyles } from '../styles/appStyles';
import { ScanResult, DeliveryItem } from '../types';
import { getProductKey, findExpectedQuantity } from '../utils/data';

interface LabelsDetailPanelProps {
  lastScan: ScanResult | null;
  history: ScanResult[];
  labelCounts: Record<string, number>;
  deliveryItems: DeliveryItem[];
  historyOpen: boolean;
  expandedIndex: number | null;
  onToggleHistory: () => void;
  onToggleExpanded: (idx: number) => void;
  onDecrement: (key: string) => void;
  onIncrement: (key: string) => void;
  onAddQuantity: (productName: string) => void;
}

export const LabelsDetailPanel: React.FC<LabelsDetailPanelProps> = ({
  lastScan,
  history,
  labelCounts,
  deliveryItems,
  historyOpen,
  expandedIndex,
  onToggleHistory,
  onToggleExpanded,
  onDecrement,
  onIncrement,
  onAddQuantity,
}) => {
  return (
    <>
      <View style={appStyles.row}>
        <Text style={appStyles.label}>Dernier résultat étiquette</Text>
        <TouchableOpacity onPress={onToggleHistory}>
          <Text style={appStyles.link}>
            {historyOpen ? 'Réduire' : 'Voir historique'}
          </Text>
        </TouchableOpacity>
      </View>

      {lastScan ? (
        <View style={appStyles.scanCard}>
          <Text style={appStyles.scanType}>
            {lastScan.parsed?.product_name ?? 'Produit inconnu'}
          </Text>
          <Text style={appStyles.scanData}>
            Origine: {lastScan.parsed?.origin ?? '—'} · Calibre:{' '}
            {lastScan.parsed?.calibre ?? '—'} · Cat:{' '}
            {lastScan.parsed?.category ?? '—'}
          </Text>
          <Text style={appStyles.scanTime}>
            Lot: {lastScan.parsed?.lots ?? '—'} · Traçabilité:{' '}
            {lastScan.parsed?.traceability_code ?? '—'}
          </Text>
          <View style={appStyles.complianceRow}>
            <View
              style={[
                appStyles.badge,
                lastScan.errors?.length == 0
                  ? appStyles.badgeOk
                  : appStyles.badgeKo,
              ]}
            />
            <Text style={appStyles.complianceText}>
              <Text> {lastScan.errors ? lastScan.errors : ""} </Text>
              {(lastScan.errors?.length ?? 0) == 0
                ? 'Conforme (champs clés présents)'
                : `Non conforme : ${lastScan.errors?.join() ?? 'champs manquants'}`}
            </Text>
          </View>

          {(() => {
            const key = getProductKey(lastScan.parsed?.product_name);
            const scanned = key ? labelCounts[key] ?? 0 : 0;
            const expected = findExpectedQuantity(
              lastScan.parsed?.product_name,
              deliveryItems
            );

            if (!key) {
              return null;
            }

            return (
              <View style={appStyles.lastScanCountSection}>
                <Text style={appStyles.lastScanCountText}>
                  Étiquettes scannées: {scanned}
                  {expected != null ? ` / ${expected}` : ''}
                </Text>
                <View style={appStyles.lastScanCountButtons}>
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
                    onPress={() => onIncrement(key)}
                  >
                    <Text style={appStyles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>
      ) : (
        <Text style={appStyles.muted}>Aucun scan pour le moment</Text>
      )}

      {historyOpen && history.length > 0 && (
        <View style={appStyles.historyBox}>
          <Text style={appStyles.historyTitle}>Historique</Text>
          <ScrollView
            style={appStyles.historyList}
            contentContainerStyle={appStyles.historyContent}
          >
            {history.map((item, idx) => {
              const expanded = expandedIndex === idx;
              const key = getProductKey(item.parsed?.product_name);
              const scanned = key ? labelCounts[key] ?? 0 : 0;
              const expected = findExpectedQuantity(
                item.parsed?.product_name,
                deliveryItems
              );

              return (
                <TouchableOpacity
                  key={item.tempId ?? `${item.parsed?.product_name ?? 'prod'}-${idx}`}
                  style={appStyles.historyItem}
                  onPress={() => onToggleExpanded(expanded ? -1 : idx)}
                >
                  <View style={appStyles.historyHeader}>
                    <View
                      style={[
                        appStyles.badge,
                        item.errors?.length == 0
                          ? appStyles.badgeOk
                          : appStyles.badgeKo,
                      ]}
                    />
                    <Text style={appStyles.historyProduct}>
                      {item.parsed?.product_name ?? 'Produit'}
                    </Text>
                  </View>
                  <Text style={appStyles.historyMeta}>
                    Origine {item.parsed?.origin ?? '—'} • Calibre{' '}
                    {item.parsed?.calibre ?? '—'} • Cat{' '}
                    {item.parsed?.category ?? '—'}
                  </Text>
                  <Text style={appStyles.historyMeta}>
                    Lot {item.parsed?.lots ?? '—'} • Traçabilité{' '}
                    {item.parsed?.traceability_code ?? '—'}
                  </Text>

                  {key && (
                    <View style={appStyles.historyCountSection}>
                      <Text style={appStyles.historyMeta}>
                        Étiquettes scannées: {scanned}
                        {expected != null ? ` / ${expected}` : ''}
                      </Text>
                      <View style={appStyles.historyCountButtons}>
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
                          onPress={() => onIncrement(key)}
                        >
                          <Text style={appStyles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <Text style={appStyles.historyMeta}>
                    { (item.errors?.length ?? 0) == 0
                      ? 'Conforme'
                      : `Non conforme : ${item.errors?.join(', ') || 'champs manquants'}`}
                  </Text>

                  {expanded && (
                    <View style={appStyles.expandedBox}>
                      {[
                        ['Produit', item.parsed?.product_name],
                        ['Variété', item.parsed?.variety],
                        ['Origine', item.parsed?.origin],
                        ['Catégorie', item.parsed?.category],
                        ['Calibre', item.parsed?.calibre],
                        ['Nombre', item.parsed?.piece_count],
                        ['Lot', item.parsed?.lots],
                        ['Traçabilité', item.parsed?.traceability_code],
                        ['Traitement post production', item.parsed?.post_product_treatement],
                        ['Bio', item.parsed?.bio ? "Bio" : "Pas bio"],
                        ['Mentions complémentaires', item.parsed?.additionals_informations],
                        ['Préemballé', item.parsed?.prepacked ? "Préemballé" : "Pas préemballé"],
                        ['Code de datage', item.parsed?.datage_code],
                        ['Poids net', item.parsed?.net_weight],
                        ['Emballeur', item.parsed?.packer_name_address],
                        ['Code emballeur', item.parsed?.packer_iso_code],
                        ["Emballé pour", item.parsed?.packed_for_name_address],
                      ].map(([label, value]) => (
                        <Text key={label} style={appStyles.expandedRow}>
                          {label}: {value ?? '—'}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </>
  );
};
