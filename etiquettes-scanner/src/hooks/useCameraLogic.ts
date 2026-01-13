import { useCallback, useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { CameraView } from 'expo-camera';
import { uploadLabel, uploadDelivery, createScanResult } from '../utils/api';
import { LABEL_IMAGE_CONFIG } from '../utils/config';
import { ScanResult, Mode, DeliveryNote } from '../types';
import { updateLabelCounts } from '../utils/data';

interface UseCameraLogicProps {
  mode: Mode;
  onLabelScanned: (result: ScanResult, counts: Record<string, number>) => void;
  onDeliveryScanned: (delivery: DeliveryNote) => void;
  onError: (error: string) => void;
}

export function useCameraLogic({
  mode,
  onLabelScanned,
  onDeliveryScanned,
  onError,
}: UseCameraLogicProps) {
  // Tous les useRef d'abord
  const cameraRef = useRef<CameraView | null>(null);
  const capturingRef = useRef(false);

  // Puis tous les useState
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [labelCounts, setLabelCounts] = useState<Record<string, number>>({});

  // Définir les handlers d'upload en premier (sans dépendre de handleCapture)
  const handleLabelUpload = useCallback(
    async (photoBase64: string, filename: string) => {
      setUploadingCount((c) => c + 1);
      onError('');

      try {
        const data = await uploadLabel(photoBase64, filename);
        const result = createScanResult(
          data.image ?? '',
          data.raw ?? '',
          data.errors ?? [],
          data.parsed ?? {}
        );

        setLabelCounts((prev) => {
          const newCounts = updateLabelCounts(
            prev,
            result.parsed.product_name
          );
          onLabelScanned(result, newCounts);
          return newCounts;
        });

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      } catch (e: any) {
        console.error('Upload label error', e);
        onError(e?.message ?? 'Erreur inconnue');
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        ).catch(() => {});
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    },
    [onLabelScanned, onError]
  );

  const handleDeliveryUpload = useCallback(
    async (photoBase64: string, filename: string) => {
      setUploadingCount((c) => c + 1);
      onError('');

      try {
        const newDelivery = await uploadDelivery(photoBase64, filename);
        setLabelCounts({});
        onDeliveryScanned(newDelivery);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      } catch (e: any) {
        console.error('Upload delivery error', e);
        onError(e?.message ?? 'Erreur BL inconnue');
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        ).catch(() => {});
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    },
    [onDeliveryScanned, onError]
  );

  // handleCapture dépend de handleLabelUpload et handleDeliveryUpload
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturingRef.current) return;
    onError('');
    setIsCapturing(true);
    capturingRef.current = true;

    try {
      console.log('Capture: start');
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 1,
        skipProcessing: false,
      });
      capturingRef.current = false;
      setIsCapturing(false);

      if (!photo?.base64) {
        throw new Error(
          "La photo n'a pas pu être encodée en base64."
        );
      }

      console.log(
        'Capture: photo ok, size base64 ~',
        photo.base64.length
      );
      const filenameBase = photo.uri?.split('/').pop() ?? 'capture.jpg';

      if (mode === 'labels') {
        // Rogner selon un cadrant central
        const cropWidth = photo.width * LABEL_IMAGE_CONFIG.cropRatio;
        const cropHeight = photo.height * LABEL_IMAGE_CONFIG.heightRatio;
        const crop = {
          originX: (photo.width - cropWidth) / 2,
          originY: (photo.height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        };

        const cropped = await manipulateAsync(photo.uri, [{ crop }], {
          compress: LABEL_IMAGE_CONFIG.compress,
          format: SaveFormat.JPEG,
          base64: true,
        });

        if (!cropped.base64) {
          throw new Error('Le rognage a échoué.');
        }

        const filename = filenameBase.replace(/\.jpg$/i, '_crop.jpg');
        handleLabelUpload(cropped.base64, filename);
      } else {
        // Mode BL: envoyer la page complète
        handleDeliveryUpload(photo.base64, filenameBase);
      }
    } catch (e: any) {
      capturingRef.current = false;
      setIsCapturing(false);
      console.error('Capture error', e);
      onError(e?.message ?? 'Erreur inconnue');
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      ).catch(() => {});
    }
  }, [mode, onError, handleLabelUpload, handleDeliveryUpload]);

  return {
    cameraRef,
    isCapturing,
    uploadingCount,
    labelCounts,
    setLabelCounts,
    handleCapture,
  };
}
