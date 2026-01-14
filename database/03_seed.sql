-- Seed data: utilisateurs de test

-- Super U
INSERT INTO domains (domain_name) VALUES ('superu.com') ON CONFLICT (domain_name) DO NOTHING;
INSERT INTO users (email, domain_id, full_name) 
SELECT 'alice@superu.com', id, 'Alice Martin' FROM domains WHERE domain_name = 'superu.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, domain_id, full_name) 
SELECT 'bob@superu.com', id, 'Bob Dupont' FROM domains WHERE domain_name = 'superu.com'
ON CONFLICT (email) DO NOTHING;

-- Carrefour
INSERT INTO domains (domain_name) VALUES ('carrefour.fr') ON CONFLICT (domain_name) DO NOTHING;
INSERT INTO users (email, domain_id, full_name) 
SELECT 'charlie@carrefour.fr', id, 'Charlie Laurent' FROM domains WHERE domain_name = 'carrefour.fr'
ON CONFLICT (email) DO NOTHING;

-- Leclerc
INSERT INTO domains (domain_name) VALUES ('leclerc.fr') ON CONFLICT (domain_name) DO NOTHING;
INSERT INTO users (email, domain_id, full_name) 
SELECT 'diana@leclerc.fr', id, 'Diana Moreau' FROM domains WHERE domain_name = 'leclerc.fr'
ON CONFLICT (email) DO NOTHING;
