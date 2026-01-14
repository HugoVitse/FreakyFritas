-- Trigger: Assigner automatiquement le domaine basé sur l'email
CREATE OR REPLACE FUNCTION auto_assign_domain()
RETURNS TRIGGER AS $$
DECLARE
    v_domain_name TEXT;
    v_domain_id INTEGER;
BEGIN
    -- Extraire le domaine de l'email (partie après @)
    v_domain_name := SPLIT_PART(NEW.email, '@', 2);
    
    -- Créer le domaine s'il n'existe pas
    INSERT INTO domains (domain_name)
    VALUES (v_domain_name)
    ON CONFLICT (domain_name) DO NOTHING;
    
    -- Récupérer l'ID du domaine
    SELECT id INTO v_domain_id FROM domains WHERE domain_name = v_domain_name;
    NEW.domain_id := v_domain_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_domain
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION auto_assign_domain();


-- Trigger: Lier automatiquement la session au domaine de l'utilisateur
CREATE OR REPLACE FUNCTION set_session_domain()
RETURNS TRIGGER AS $$
BEGIN
    SELECT domain_id INTO NEW.domain_id 
    FROM users WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_session_domain
BEFORE INSERT ON reception_sessions
FOR EACH ROW EXECUTE FUNCTION set_session_domain();
