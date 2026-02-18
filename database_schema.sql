-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('admin', 'qa', 'store');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE parameter_category AS ENUM ('chemical', 'mechanical', 'dimensional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE po_status AS ENUM ('draft', 'approved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wo_status AS ENUM ('draft', 'approved', 'in_production', 'lab_pending', 'completed', 'closed', 'rejected', 'on_hold', 'reopened');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('allocation', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM ('pending', 'passed', 'failed', 'override');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tc_status AS ENUM ('prepared', 'approved', 'issued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3.2 Master Tables

CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name role_enum UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Linked to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    plant_id UUID NOT NULL REFERENCES plants(id),
    UNIQUE(user_id, role_id, plant_id)
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    gst_number VARCHAR(50),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS standard_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    category parameter_category NOT NULL,
    unit VARCHAR(50),
    min_value NUMERIC,
    max_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ,
    UNIQUE(standard_id, parameter_name)
);

-- 4. Transaction Tables (Must include plant_id)

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    order_date DATE,
    status po_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    wo_number VARCHAR(100) UNIQUE NOT NULL,
    po_id UUID REFERENCES purchase_orders(id),
    item_id UUID REFERENCES items(id),
    quantity NUMERIC,
    status wo_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS heats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    heat_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_name VARCHAR(255),
    material_grade VARCHAR(255),
    received_date DATE,
    initial_quantity NUMERIC,
    available_quantity NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    heat_id UUID REFERENCES heats(id),
    work_order_id UUID REFERENCES work_orders(id),
    movement_type movement_type NOT NULL,
    quantity NUMERIC NOT NULL,
    movement_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    work_order_id UUID REFERENCES work_orders(id),
    tested_at TIMESTAMPTZ,
    tested_by UUID REFERENCES users(id),
    validation_status validation_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS lab_result_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
    parameter_id UUID REFERENCES standard_parameters(id),
    observed_value NUMERIC NOT NULL,
    validation_status validation_status DEFAULT 'pending',
    override_flag BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(lab_result_id, parameter_id)
);

CREATE TABLE IF NOT EXISTS test_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    work_order_id UUID REFERENCES work_orders(id),
    current_version INTEGER DEFAULT 1,
    status tc_status DEFAULT 'prepared',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS test_certificate_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    tc_id UUID REFERENCES test_certificates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    pdf_url TEXT,
    generated_at TIMESTAMPTZ DEFAULT now(),
    generated_by UUID REFERENCES users(id),
    approval_status tc_status DEFAULT 'prepared',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(tc_id, version_number)
);

CREATE TABLE IF NOT EXISTS override_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES plants(id),
    table_name VARCHAR(100),
    record_id UUID,
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID REFERENCES plants(id), -- Nullable if global
    table_name VARCHAR(100),
    record_id UUID,
    operation audit_operation,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT now(),
    old_data JSONB,
    new_data JSONB
);

-- RLS Policies

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE heats ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_certificate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE override_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function for RLS
CREATE OR REPLACE FUNCTION auth.user_plants()
RETURNS TABLE (plant_id UUID) AS $$
  SELECT plant_id FROM public.user_roles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies to avoid conflict on re-run
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON plants;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON roles;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON users;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON user_roles;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON customers;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON items;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON standards;
    DROP POLICY IF EXISTS "Allow read access to master data for authenticated users" ON standard_parameters;

    DROP POLICY IF EXISTS "Plant based access for POs" ON purchase_orders;
    DROP POLICY IF EXISTS "Plant based access for WOs" ON work_orders;
    DROP POLICY IF EXISTS "Plant based access for Heats" ON heats;
    DROP POLICY IF EXISTS "Plant based access for Inventory" ON inventory_movements;
    DROP POLICY IF EXISTS "Plant based access for Lab Results" ON lab_results;
    DROP POLICY IF EXISTS "Plant based access for Lab Result Params" ON lab_result_parameters;
    DROP POLICY IF EXISTS "Plant based access for TCs" ON test_certificates;
    DROP POLICY IF EXISTS "Plant based access for TC Versions" ON test_certificate_versions;
    DROP POLICY IF EXISTS "Plant based access for Override Logs" ON override_logs;
    DROP POLICY IF EXISTS "Plant based access for Audit Logs" ON audit_logs;
END $$;

CREATE POLICY "Allow read access to master data for authenticated users" ON plants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON standards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to master data for authenticated users" ON standard_parameters FOR SELECT TO authenticated USING (true);

-- Transactional Data Policies (Plant Scoped)

CREATE POLICY "Plant based access for POs" ON purchase_orders
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for WOs" ON work_orders
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Heats" ON heats
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Inventory" ON inventory_movements
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Lab Results" ON lab_results
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Lab Result Params" ON lab_result_parameters
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for TCs" ON test_certificates
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for TC Versions" ON test_certificate_versions
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Override Logs" ON override_logs
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));

CREATE POLICY "Plant based access for Audit Logs" ON audit_logs
    TO authenticated
    USING (plant_id IN (SELECT plant_id FROM auth.user_plants()));


-- Triggers

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at_and_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_modtime ON customers;
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_items_modtime ON items;
CREATE TRIGGER update_items_modtime BEFORE UPDATE ON items FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_standards_modtime ON standards;
CREATE TRIGGER update_standards_modtime BEFORE UPDATE ON standards FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_standard_parameters_modtime ON standard_parameters;
CREATE TRIGGER update_standard_parameters_modtime BEFORE UPDATE ON standard_parameters FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


DROP TRIGGER IF EXISTS update_purchase_orders_modtime ON purchase_orders;
CREATE TRIGGER update_purchase_orders_modtime BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_work_orders_modtime ON work_orders;
CREATE TRIGGER update_work_orders_modtime BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_heats_modtime ON heats;
CREATE TRIGGER update_heats_modtime BEFORE UPDATE ON heats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_inventory_movements_modtime ON inventory_movements;
CREATE TRIGGER update_inventory_movements_modtime BEFORE UPDATE ON inventory_movements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_lab_results_modtime ON lab_results;
CREATE TRIGGER update_lab_results_modtime BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_lab_result_parameters_modtime ON lab_result_parameters;
CREATE TRIGGER update_lab_result_parameters_modtime BEFORE UPDATE ON lab_result_parameters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_test_certificates_modtime ON test_certificates;
CREATE TRIGGER update_test_certificates_modtime BEFORE UPDATE ON test_certificates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_test_certificate_versions_modtime ON test_certificate_versions;
CREATE TRIGGER update_test_certificate_versions_modtime BEFORE UPDATE ON test_certificate_versions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

DROP TRIGGER IF EXISTS update_override_logs_modtime ON override_logs;
CREATE TRIGGER update_override_logs_modtime BEFORE UPDATE ON override_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_and_by();

-- Audit Log Trigger

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    current_plant_id UUID;
    record_id_val UUID;
BEGIN
    -- Determine plant_id
    IF (TG_OP = 'DELETE') THEN
        current_plant_id := OLD.plant_id;
        record_id_val := OLD.id;
    ELSE
        current_plant_id := NEW.plant_id;
        record_id_val := NEW.id;
    END IF;

    INSERT INTO audit_logs (
        plant_id,
        table_name,
        record_id,
        operation,
        changed_by,
        old_data,
        new_data
    ) VALUES (
        current_plant_id,
        TG_TABLE_NAME,
        record_id_val,
        TG_OP::audit_operation,
        auth.uid(),
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_work_orders ON work_orders;
CREATE TRIGGER audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON work_orders FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_lab_results ON lab_results;
CREATE TRIGGER audit_lab_results AFTER INSERT OR UPDATE OR DELETE ON lab_results FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_lab_result_parameters ON lab_result_parameters;
CREATE TRIGGER audit_lab_result_parameters AFTER INSERT OR UPDATE OR DELETE ON lab_result_parameters FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_test_certificates ON test_certificates;
CREATE TRIGGER audit_test_certificates AFTER INSERT OR UPDATE OR DELETE ON test_certificates FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_heats ON heats;
CREATE TRIGGER audit_heats AFTER INSERT OR UPDATE OR DELETE ON heats FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_inventory_movements ON inventory_movements;
CREATE TRIGGER audit_inventory_movements AFTER INSERT OR UPDATE OR DELETE ON inventory_movements FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

-- Initial Seed for Roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator'),
('qa', 'Quality Assurance'),
('store', 'Store Manager')
ON CONFLICT (name) DO NOTHING;
