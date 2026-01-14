-- Extension pour générer des IDs uniques (UUID)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Les Domaines (Magasins/Enseignes)
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Les Utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    domain_id INTEGER REFERENCES domains(id),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Les Sessions de Réception
CREATE TABLE reception_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    domain_id INTEGER REFERENCES domains(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, error
    is_compliant BOOLEAN DEFAULT FALSE
);

-- 4. Les Bons de Livraison (1 seul par session)
CREATE TABLE delivery_notes (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES reception_sessions(id) UNIQUE,
    image_path TEXT NOT NULL,
    order_number VARCHAR(100),
    expected_items_count INTEGER,
    raw_ocr_data JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Les Étiquettes (plusieurs par session)
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES reception_sessions(id),
    image_path TEXT NOT NULL,
    sku_code VARCHAR(100),
    is_conform BOOLEAN DEFAULT FALSE,
    raw_ocr_data JSONB,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);