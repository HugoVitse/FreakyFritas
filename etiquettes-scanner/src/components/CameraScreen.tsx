import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { appStyles } from '../styles/appStyles';
import { Mode } from '../types';

interface CameraScreenProps {
  cameraRef: React.RefObject<CameraView | null>;
  mode: Mode;
  flash: 'on' | 'off';
  isCapturing: boolean;
  uploadingCount: number;
  onCapture: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  cameraRef,
  mode,
  flash,
  isCapturing,
  uploadingCount,
  onCapture,
}) => {
  return (
    <View style={appStyles.cameraWrapper}>
      <CameraView
        style={appStyles.camera}
        facing="back"
        flash={flash}
        ref={cameraRef}
      />
      <View style={appStyles.overlay}>
        <Text style={appStyles.title}>
          {mode === 'labels'
            ? "Photographiez l'étiquette"
            : 'Photographiez le bon de livraison'}
        </Text>
        <Text style={appStyles.subtitle}>
          {mode === 'labels'
            ? "Placez l'étiquette au centre, évitez le flou"
            : 'Cadrez la page entière, bien nette'}
        </Text>
      </View>
      {mode === 'labels' && (
        <View style={appStyles.guideFrame} pointerEvents="none" />
      )}
      <View style={appStyles.captureZone}>
        <TouchableOpacity
          style={[
            appStyles.shutter,
            (isCapturing || uploadingCount > 0) && appStyles.shutterDisabled,
          ]}
          onPress={onCapture}
          disabled={isCapturing}
        >
          <Text style={appStyles.shutterText}>
            {isCapturing ? 'CAPTURE...' : 'CAPTURER'}
          </Text>
        </TouchableOpacity>
        {uploadingCount > 0 && (
          <Text style={appStyles.uploadingInfo}>
            Envoi en cours : {uploadingCount}
          </Text>
        )}
      </View>
    </View>
  );
};
