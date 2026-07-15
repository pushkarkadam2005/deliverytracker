-- V8: Add dimensions, order type, rescheduled date, coordinates, and actor fields

-- 1. Add fields to shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS order_type VARCHAR(50);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS rescheduled_date TIMESTAMP;

-- Constraint checks for shipments
ALTER TABLE shipments ADD CONSTRAINT chk_shipments_order_type CHECK (order_type IN ('B2B', 'B2C'));

-- 2. Add order_type field to rate_cards table
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS order_type VARCHAR(50);

-- Constraint check for rate_cards
ALTER TABLE rate_cards ADD CONSTRAINT chk_rate_cards_order_type CHECK (order_type IN ('B2B', 'B2C'));

-- 3. Add actor field to tracking_histories table
ALTER TABLE tracking_histories ADD COLUMN IF NOT EXISTS actor VARCHAR(100);

-- 4. Add coordinates to areas table
ALTER TABLE areas ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- 5. Backfill/update seeded and existing data to ensure integrity
UPDATE shipments SET order_type = 'B2C' WHERE order_type IS NULL;
UPDATE rate_cards SET order_type = 'B2C' WHERE order_type IS NULL;
UPDATE tracking_histories SET actor = 'SYSTEM' WHERE actor IS NULL;

UPDATE areas SET latitude = 28.6139, longitude = 77.2090 WHERE pincode IN ('110001', '110002');
UPDATE areas SET latitude = 28.5039, longitude = 77.0878 WHERE pincode = '122001';
