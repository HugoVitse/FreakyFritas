import { API_URL, OCR_CONFIG, REQUIRED_FIELDS } from './config';
import { ParsedFields, ScanResult, DeliveryNote } from '../types';

export async function loginUser(email: string): Promise<{ user_id: number; email: string; domain: string; full_name?: string }> {
  const endpoint = `${API_URL}/auth/login`;
  console.log('Auth call ->', endpoint);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error('Auth error', res.status, msg);
    throw new Error(msg || `Erreur HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error('Authentification échouée');
  }
  return data;
}

export async function uploadLabel(
  photoBase64: string,
  filename: string
): Promise<{ parsed: ParsedFields; image: string; raw: string }> {
  const payload = {
    image_base64: photoBase64,
    filename,
    use_mistral: OCR_CONFIG.useMistral,
    use_paddle: OCR_CONFIG.usePaddle,
    use_llm: OCR_CONFIG.useLlm,
  };

  const endpoint = `${API_URL}/scan`;
  console.log('API call ->', endpoint);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error('API error', res.status, msg);
    throw new Error(msg || `Erreur HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log('API success, parsed keys:', Object.keys(data.parsed ?? {})  );
  return data;
}

export async function uploadDelivery(
  photoBase64: string,
  filename: string
): Promise<DeliveryNote> {
  const payload = {
    image_base64: photoBase64,
    filename,
    use_llm: OCR_CONFIG.useLlm,
    use_paddle: OCR_CONFIG.usePaddle,
  };

  const endpoint = `${API_URL}/scan-bl`;
  console.log('API call BL ->', endpoint);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error('API error BL', res.status, msg);
    throw new Error(msg || `Erreur HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log('API BL success, items:', data.parsed?.items?.length ?? 0);
  return data.parsed ?? {
    shipper_name_address: null,
    shipper_siret: null,
    delivery_note_number: null,
    delivery_date: null,
    recipient_name_address: null,
    recipient_siret: null,
    items: [],
  };
}

export function getMissingFields(parsed: ParsedFields): string[] {
  return REQUIRED_FIELDS
    .filter(([key]) => !parsed[key as keyof ParsedFields])
    .map(([, label]) => label);
}

export function createScanResult(
  image: string,
  raw: string,
  errors: string[],
  parsed: ParsedFields
): ScanResult {
  const missing = getMissingFields(parsed);
  return {
    image,
    raw,
    parsed,
    errors,
    compliance: { ok: missing.length === 0, missing },
  };
}
