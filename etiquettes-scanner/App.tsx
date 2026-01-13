import React, { useState, useCallback, useMemo } from 'react';
import { StatusBar, SafeAreaView, View, TouchableOpacity, Text } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import {
  HomeScreen,
  CameraScreen,
  BottomControls,
  DeliveryModal,
  QuantityInputModal,
  DeliveryDetailPanel,
  LabelsDetailPanel,
  SummaryScreen,
  PermissionScreen,
  LandingScreen,
  LoginScreen,
} from './src/components';
import { useCameraLogic, useWorkflow, useModals } from './src/hooks';
import { appStyles } from './src/styles/appStyles';
import { ScanResult, DeliveryNote, Mode, FlashMode } from './src/types';
import { getTotalLabelCounts, getProductKey } from './src/utils/data';

type AuthState = 'landing' | 'login' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [mode, setMode] = useState<Mode>('bl');
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [delivery, setDelivery] = useState<DeliveryNote | null>(null);
  const [blHistory, setBlHistory] = useState<DeliveryNote | null>(null);

  const {
    historyOpen,
    setHistoryOpen,
    blModalOpen,
    setBlModalOpen,
    quantityModalOpen,
    quantityModalProduct,
    quantityInput,
    setQuantityInput,
    bottomPanelCollapsed,
    setBottomPanelCollapsed,
    expandedIndex,
    setExpandedIndex,
    openQuantityModal,
    closeQuantityModal,
  } = useModals();

  const { workflowStep, startNewDelivery, goToLabelsScan, goToSummary, finishDelivery } =
    useWorkflow();

  const { cameraRef, isCapturing, uploadingCount, labelCounts, setLabelCounts, handleCapture } =
    useCameraLogic({
      mode,
      onLabelScanned: (result, counts) => {
        console.log(result)
        setLastScan(result);
        setHistory((prev) => [result, ...prev].slice(0, 20));
      },
      onDeliveryScanned: (newDelivery) => {
        setDelivery(newDelivery);
        setBlHistory(newDelivery);
      },
      onError: setError,
    });

  const handleAddQuantity = useCallback(() => {
    if (!quantityModalProduct) return;
    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Veuillez entrer une quantité valide');
      return;
    }
    const key = getProductKey(quantityModalProduct);
    setLabelCounts((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + qty,
    }));
    closeQuantityModal();
    setError(null);
  }, [quantityModalProduct, quantityInput, closeQuantityModal]);

  const handleValidateBlScan = useCallback(() => {
    if (!delivery) return;
    setError(null);
    setBlModalOpen(false);
    setTimeout(() => {
      goToLabelsScan();
    }, 300);
  }, [delivery, goToLabelsScan]);

  const handleDecrement = useCallback((key: string) => {
    setLabelCounts((prev) => {
      const newCounts = { ...prev };
      if (newCounts[key] && newCounts[key] > 0) {
        newCounts[key] -= 1;
      }
      return newCounts;
    });
  }, []);

  const handleIncrement = useCallback((key: string) => {
    setLabelCounts((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
  }, []);

  const needPermission = !permission?.granted;
  const permissionView = useMemo(() => {
    if (!permission) {
      return <PermissionScreen loading={true} onRequest={requestPermission} />;
    }
    if (needPermission) {
      return <PermissionScreen loading={false} onRequest={requestPermission} />;
    }
    return null;
  }, [needPermission, permission, requestPermission]);

  // Handle authentication
  if (authState === 'landing') {
    return (
      <LandingScreen
        onLogin={() => setAuthState('login')}
        onSignUp={() => setAuthState('login')}
      />
    );
  }

  if (authState === 'login') {
    return (
      <LoginScreen
        onLogin={(username, password) => {
          // Simple mock authentication
          if (username && password) {
            setAuthState('authenticated');
          }
        }}
        onSignUp={() => setAuthState('login')}
        onBack={() => setAuthState('landing')}
      />
    );
  }

  if (permissionView) {
    return permissionView;
  }

  if (workflowStep === 'home') {
    return (
      <HomeScreen
        productCount={Object.keys(labelCounts).length}
        totalColis={getTotalLabelCounts(labelCounts)}
        onStartNewDelivery={startNewDelivery}
      />
    );
  }

  if (workflowStep === 'summary') {
    return (
      <SummaryScreen
        blHistory={blHistory}
        labelCounts={labelCounts}
        onContinueScan={goToLabelsScan}
        onFinishDelivery={finishDelivery}
      />
    );
  }

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="light-content" />
      <View style={appStyles.cameraWrapper}>
        <CameraScreen
          cameraRef={cameraRef}
          mode={mode}
          flash={flash}
          isCapturing={isCapturing}
          uploadingCount={uploadingCount}
          onCapture={handleCapture}
        />
        <View style={appStyles.bottomPanel}>
          <BottomControls
            mode={mode}
            onModeChange={setMode}
            flash={flash}
            onFlashChange={() => setFlash((prev) => (prev === 'on' ? 'off' : 'on'))}
            collapsed={bottomPanelCollapsed}
            onCollapseChange={setBottomPanelCollapsed}
            error={error}
          />
          {!bottomPanelCollapsed && (
            <>
              {delivery && (
                <DeliveryDetailPanel
                  delivery={delivery}
                  labelCounts={labelCounts}
                  historyOpen={historyOpen}
                  onToggleHistory={() => setHistoryOpen((v) => !v)}
                  onOpenModal={() => setBlModalOpen(true)}
                  onDecrement={handleDecrement}
                  onAddQuantity={openQuantityModal}
                />
              )}
              {mode === 'labels' && (
                <>
                  <LabelsDetailPanel
                    lastScan={lastScan}
                    history={history}
                    labelCounts={labelCounts}
                    deliveryItems={blHistory?.items ?? []}
                    historyOpen={historyOpen}
                    expandedIndex={expandedIndex}
                    onToggleHistory={() => setHistoryOpen((v) => !v)}
                    onToggleExpanded={(idx) =>
                      setExpandedIndex(expandedIndex === idx ? null : idx)
                    }
                    onDecrement={handleDecrement}
                    onIncrement={handleIncrement}
                    onAddQuantity={openQuantityModal}
                  />
                  {workflowStep === 'labels-scan' && history.length > 0 && (
                    <TouchableOpacity
                      style={appStyles.goToSummaryButton}
                      onPress={goToSummary}
                    >
                      <Text style={appStyles.goToSummaryButtonText}>✅ Voir Résumé</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </View>
      <DeliveryModal
        delivery={delivery!}
        labelCounts={labelCounts}
        visible={blModalOpen && delivery != null}
        onClose={() => setBlModalOpen(false)}
        onValidate={handleValidateBlScan}
      />
      <QuantityInputModal
        visible={quantityModalOpen}
        productName={quantityModalProduct}
        quantity={quantityInput}
        onQuantityChange={setQuantityInput}
        onConfirm={handleAddQuantity}
        onCancel={closeQuantityModal}
      />
    </SafeAreaView>
  );
}
