import { StyleSheet } from 'react-native';

// Palette de couleurs inspirée de Fridel
const colors = {
  // Backgrounds & Surfaces
  background: '#ffffff',
  surfaceLight: '#f3f3f5',
  surfaceMedium: '#ececf0',
  surfaceDark: '#f9f9fa',
  
  // Texte
  textDark: '#030213',
  textLight: '#717182',
  textSubtle: '#9ca3af',
  
  // Accent colors
  primary: '#7c3aed', // Purple (Fridel-inspired)
  primaryDark: '#6d28d9',
  primaryLight: '#a78bfa',
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  
  // Neutral
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
};

export const appStyles = StyleSheet.create({
  // Écran d'accueil
  homeScreen: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.background,
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 32,
  },
  homeTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 16,
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: 12,
  },
  homeStats: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  // Écran de résumé
  summaryScreen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  summaryHeader: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  summaryBl: {
    fontSize: 14,
    color: colors.textLight,
  },
  summarySection: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  summaryRow: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
  },
  summaryLabel: {
    fontWeight: '600',
    color: colors.textDark,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceMedium,
    marginBottom: 8,
  },
  comparisonOk: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  comparisonKo: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  comparisonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  comparisonName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  comparisonStats: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  comparisonStatus: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryComplete: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  summaryIncomplete: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  summaryStatus: {
    fontSize: 14,
    color: colors.textSubtle,
  },
  summaryButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  summaryButtonSecondary: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  summaryButtonPrimary: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryButtonDisabled: {
    backgroundColor: colors.surfaceMedium,
    opacity: 0.5,
  },
  summaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  // Bouton voir résumé
  goToSummaryButton: {
    backgroundColor: colors.success,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  goToSummaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  guideFrame: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: '50%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  captureZone: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutter: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterText: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: '#f3f4f6',
    marginTop: 4,
  },
  bottomPanel: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  bottomPanelHeader: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  bottomPanelHeaderText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textDark,
    fontWeight: '600',
  },
  chipActiveText: {
    color: 'white',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  scanCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scanType: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scanData: {
    color: colors.textDark,
    fontSize: 16,
  },
  scanTime: {
    color: colors.textLight,
    fontSize: 12,
  },
  muted: {
    color: colors.textLight,
  },
  error: {
    color: colors.error,
    fontWeight: '600',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '600',
  },
  modeChipActiveText: {
    color: 'white',
  },
  historyBox: {
    marginTop: 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
  },
  historyTitle: {
    color: colors.textDark,
    fontWeight: '700',
    marginBottom: 6,
  },
  historyList: {
    maxHeight: 220,
  },
  historyContent: {
    gap: 8,
  },
  historyItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyProduct: {
    color: colors.textDark,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.textLight,
    fontSize: 12,
  },
  historyCountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  historyCountButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastScanCountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  lastScanCountText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  lastScanCountButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedBox: {
    marginTop: 6,
    backgroundColor: colors.surfaceMedium,
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  expandedRow: {
    color: colors.textDark,
    fontSize: 12,
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  badgeOk: {
    backgroundColor: colors.success,
  },
  badgeKo: {
    backgroundColor: colors.error,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  complianceText: {
    color: colors.textLight,
    fontSize: 12,
  },
  uploadingInfo: {
    color: colors.textSubtle,
    marginTop: 6,
    fontSize: 12,
  },
  deliveryCard: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: colors.surfaceMedium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
    gap: 2,
  },
  deliveryTitle: {
    color: colors.textDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliveryMeta: {
    color: colors.textLight,
    fontSize: 12,
  },
  deliveryItem: {
    color: colors.textDark,
    fontSize: 12,
  },
  // Styles pour la modal BL
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  modalTitle: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 16,
  },
  modalCloseButton: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  modalSection: {
    gap: 6,
  },
  modalSectionTitle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  modalRow: {
    color: colors.textDark,
    fontSize: 13,
    paddingVertical: 2,
  },
  modalLabel: {
    fontWeight: '600',
    color: colors.textLight,
  },
  modalItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalItemOk: {
    borderLeftColor: colors.success,
  },
  modalItemKo: {
    borderLeftColor: colors.error,
  },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalItemName: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 14,
  },
  modalItemDetail: {
    color: colors.textLight,
    fontSize: 12,
    marginVertical: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  modalButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.surfaceMedium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtonSecondaryText: {
    color: colors.textDark,
  },
  // Styles pour les contrôles de quantité
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonSmall: {
    width: 32,
    height: 32,
  },
  quantityButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal quantité manuelle
  quantityInputModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  quantityInputBox: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quantityInputTitle: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 16,
  },
  quantityInputLabel: {
    color: colors.textLight,
    fontSize: 14,
    marginBottom: 8,
  },
  quantityInputField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceLight,
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  quantityInputButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quantityInputButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quantityInputButtonCancel: {
    backgroundColor: colors.surfaceMedium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityInputButtonConfirm: {
    backgroundColor: colors.primary,
  },
  quantityInputButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  quantityInputButtonCancelText: {
    color: colors.textDark,
  },
});
