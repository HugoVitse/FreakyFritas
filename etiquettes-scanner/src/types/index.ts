export type ParsedFields = {
  product_name?: string | null;
  variety?: string | null;
  calibre?: string | null;
  category?: string | null;
  piece_count?: string | number | null;
  origin?: string | null;
  lots?: string | null;
  post_product_treatement?: string | null;
  bio?: boolean | null;
  prepacked? : boolean | null;
  additionals_informations? : string | null;
  datage_code?: string | null;
  traceability_code?: string | null;
  packer_name_address?: string | null;
  packer_iso_code?: string | null;
  packed_for_name_address?: string | null;
  packed_for_packer_code?: string | null;
  net_weight?: string | null;
};

export type ScanResult = {
  image: string;
  raw: string;
  errors: string[] | null;
  parsed: ParsedFields;
  compliance?: {
    ok: boolean;
    missing: string[];
  };
  tempId?: string; // ID temporaire pour les placeholders
};

export type DeliveryItem = {
  product_name: string | null;
  variety: string | null;
  quantity: number | null;
  unit: string | null;
  lot: string | null;
  origin: string | null;
};

export type DeliveryNote = {
  shipper_name_address: string | null;
  shipper_siret: string | null;
  delivery_note_number: string | null;
  delivery_date: string | null;
  recipient_name_address: string | null;
  recipient_siret: string | null;
  items: DeliveryItem[];
};

export type WorkflowStep = 'home' | 'bl-scan' | 'labels-scan' | 'summary';
export type Mode = 'labels' | 'bl';
export type FlashMode = 'on' | 'off';
