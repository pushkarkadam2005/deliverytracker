-- ==========================================================
-- V7: Seed Pricing & Delivery Agent Metadata
-- ==========================================================

-- 1. Insert Zones
INSERT INTO zones (name, description, is_active, created_at, updated_at)
VALUES 
  ('North Zone', 'Delhi central and northern regions', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('NCR Zone', 'Gurgaon and surrounding capital regions', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Areas
INSERT INTO areas (zone_id, name, pincode, city, state, is_active, created_at, updated_at)
VALUES
  ((SELECT id FROM zones WHERE name = 'North Zone'), 'Connaught Place', '110001', 'Delhi', 'Delhi', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ((SELECT id FROM zones WHERE name = 'North Zone'), 'New Delhi GPO', '110002', 'Delhi', 'Delhi', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ((SELECT id FROM zones WHERE name = 'NCR Zone'), 'Sector 21', '122001', 'Gurgaon', 'Haryana', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (pincode) DO NOTHING;

-- 3. Insert Rate Cards
-- North Zone <-> North Zone
INSERT INTO rate_cards (pickup_zone_id, delivery_zone_id, minimum_weight, maximum_weight, base_charge, per_kg_rate, cod_charge, fuel_surcharge, is_active, created_at, updated_at)
VALUES (
  (SELECT id FROM zones WHERE name = 'North Zone'),
  (SELECT id FROM zones WHERE name = 'North Zone'),
  0.00, 100.00, 40.00, 8.00, 15.00, 5.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- North Zone <-> NCR Zone
INSERT INTO rate_cards (pickup_zone_id, delivery_zone_id, minimum_weight, maximum_weight, base_charge, per_kg_rate, cod_charge, fuel_surcharge, is_active, created_at, updated_at)
VALUES (
  (SELECT id FROM zones WHERE name = 'North Zone'),
  (SELECT id FROM zones WHERE name = 'NCR Zone'),
  0.00, 100.00, 70.00, 12.00, 20.00, 8.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- NCR Zone <-> North Zone
INSERT INTO rate_cards (pickup_zone_id, delivery_zone_id, minimum_weight, maximum_weight, base_charge, per_kg_rate, cod_charge, fuel_surcharge, is_active, created_at, updated_at)
VALUES (
  (SELECT id FROM zones WHERE name = 'NCR Zone'),
  (SELECT id FROM zones WHERE name = 'North Zone'),
  0.00, 100.00, 70.00, 12.00, 20.00, 8.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- NCR Zone <-> NCR Zone
INSERT INTO rate_cards (pickup_zone_id, delivery_zone_id, minimum_weight, maximum_weight, base_charge, per_kg_rate, cod_charge, fuel_surcharge, is_active, created_at, updated_at)
VALUES (
  (SELECT id FROM zones WHERE name = 'NCR Zone'),
  (SELECT id FROM zones WHERE name = 'NCR Zone'),
  0.00, 100.00, 40.00, 8.00, 15.00, 5.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 4. Seed Default Delivery Agent
-- Password is 'Password123' (hashed using BCrypt)
INSERT INTO users (full_name, email, password, role, is_active, created_at, updated_at)
VALUES (
  'John Agent', 
  'agent@example.com', 
  '$2a$10$8.ZpG9SqxPy3x.DszW/Ld.d65nZ2Z3h9B4/cT.Xg9N3zZtGv6v0yO', 
  'AGENT', 
  TRUE, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);

INSERT INTO delivery_agents (user_id, phone, vehicle_number, availability_status, current_latitude, current_longitude, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email = 'agent@example.com'),
  '9876543210',
  'DL-3C-AB-1234',
  'AVAILABLE',
  28.6139,
  77.2090,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
