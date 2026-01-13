export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const OCR_CONFIG = {
  usePaddle: false,
  useMistral:true,
  useLlm: true,
};

export const REQUIRED_FIELDS = [
  ['product_name', 'Produit'],
  ['origin', 'Origine'],
  ['category', 'Catégorie'],
  ['calibre', 'Calibre'],
  ['lots', 'Lot'],
] as const;

export const LABEL_IMAGE_CONFIG = {
  cropRatio: 0.8,
  heightRatio: 0.5,
  compress: 0.95,
};

export const HISTORY_MAX_LENGTH = 20;
