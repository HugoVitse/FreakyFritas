import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appStyles } from '../styles/appStyles';
import { DeliveryNote } from '../types';
import {
  compareDeliveryItems,
  getTotalLabelCounts,
  ComparisonResult,
} from '../utils/data';

const colors = {
  primary: '#7c3aed',
};

interface SummaryScreenProps {
  blHistory: DeliveryNote | null;
  labelCounts: Record<string, number>;
  onContinueScan: () => void;
  onFinishDelivery: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  blHistory,
  labelCounts,
  onContinueScan,
  onFinishDelivery,
}) => {
  const totalLabelsScanned = getTotalLabelCounts(labelCounts);
  const blItems = blHistory?.items ?? [];
  const comparisonResults = compareDeliveryItems(labelCounts, blItems);
  const allOk = comparisonResults.every((r) => r.ok);

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={appStyles.summaryScreen}>
        <View style={appStyles.summaryHeader}>
          <Text style={appStyles.summaryTitle}>✅ Résumé de Livraison</Text>
          <Text style={appStyles.summaryBl}>
            {blHistory?.delivery_note_number ?? 'BL sans numéro'}
          </Text>
        </View>

        <View style={appStyles.summarySection}>
          <Text style={appStyles.sectionTitle}>📊 Informations</Text>
          <Text style={appStyles.summaryRow}>
            <Text style={appStyles.summaryLabel}>Expéditeur:</Text>{' '}
            {blHistory?.shipper_name_address ?? '—'}
          </Text>
          <Text style={appStyles.summaryRow}>
            <Text style={appStyles.summaryLabel}>Destinataire:</Text>{' '}
            {blHistory?.recipient_name_address ?? '—'}
          </Text>
          <Text style={appStyles.summaryRow}>
            <Text style={appStyles.summaryLabel}>Date:</Text>{' '}
            {blHistory?.delivery_date ?? '—'}
          </Text>
        </View>

        <View style={appStyles.summarySection}>
          <Text style={appStyles.sectionTitle}>📦 Comparaison Scannage</Text>
          {comparisonResults.map((result, idx) => (
            <View
              key={idx}
              style={[
                appStyles.comparisonRow,
                result.ok
                  ? appStyles.comparisonOk
                  : appStyles.comparisonKo,
              ]}
            >
              <View style={appStyles.comparisonLeft}>
                <View
                  style={[
                    appStyles.badge,
                    result.ok ? appStyles.badgeOk : appStyles.badgeKo,
                  ]}
                />
                <View>
                  <Text style={appStyles.comparisonName}>{result.name}</Text>
                  <Text style={appStyles.comparisonStats}>
                    {result.scanned} / {result.expected}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  appStyles.comparisonStatus,
                  result.ok ? { color: '#22c55e' } : { color: '#ef4444' },
                ]}
              >
                {result.ok ? '✓' : '✗'}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            appStyles.summarySection,
            allOk
              ? appStyles.summaryComplete
              : appStyles.summaryIncomplete,
          ]}
        >
          <Text style={appStyles.sectionTitle}>
            {allOk ? '✨ Livraison Complète!' : '⚠️ Vérification Nécessaire'}
          </Text>
          <Text style={appStyles.summaryStatus}>
            {allOk
              ? `Tous les items correspondent (${totalLabelsScanned} colis scannés)`
              : `${comparisonResults.filter((r) => !r.ok).length} item(s) ne correspond(ent) pas`}
          </Text>
        </View>

        <View style={appStyles.summaryButtons}>
          <TouchableOpacity
            style={appStyles.summaryButtonSecondary}
            onPress={onContinueScan}
          >
            <Text style={[appStyles.summaryButtonText, { color: colors.primary }]}>↩️ Continuer scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              appStyles.summaryButtonPrimary,
              !allOk && appStyles.summaryButtonDisabled,
            ]}
            onPress={() => {
              if (allOk) {
                onFinishDelivery();
              }
            }}
            disabled={!allOk}
          >
            <Text style={appStyles.summaryButtonText}>✅ Terminer Livraison</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
