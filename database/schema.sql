-- Extension pour générer des IDs uniques (UUID)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Domaines basés sur le domaine email
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    domain_id INTEGER REFERENCES domains(id),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions de réception
CREATE TABLE reception_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    domain_id INTEGER REFERENCES domains(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress'
);

-- Bons de livraison
CREATE TABLE delivery_notes (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES reception_sessions(id) UNIQUE,
    order_number VARCHAR(100),
    expected_items_count INTEGER,
    raw_ocr_data JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Étiquettes
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES reception_sessions(id),
    sku_code VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    raw_ocr_data JSONB,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_domain_id ON users(domain_id);
CREATE INDEX idx_sessions_user_id ON reception_sessions(user_id);
CREATE INDEX idx_sessions_domain_id ON reception_sessions(domain_id);
CREATE INDEX idx_labels_session_id ON labels(session_id);
