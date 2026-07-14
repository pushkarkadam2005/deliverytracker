-- ==========================================================
-- Database Tables
-- ==========================================================

-- Create shipments table mapping cargo tracking data
CREATE TABLE IF NOT EXISTS shipments (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL,
    customer_id BIGINT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_area_id BIGINT NOT NULL,
    delivery_area_id BIGINT NOT NULL,
    pickup_pincode VARCHAR(10) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(15) NOT NULL,
    actual_weight DECIMAL(10,2) NOT NULL,
    volumetric_weight DECIMAL(10,2),
    billable_weight DECIMAL(10,2),
    payment_type VARCHAR(50) NOT NULL,
    shipment_status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_shipments_tracking_number UNIQUE (tracking_number),
    CONSTRAINT fk_shipments_customer FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_shipments_payment CHECK (payment_type IN ('PREPAID', 'COD')),
    CONSTRAINT chk_shipments_status CHECK (shipment_status IN ('CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'))
);

-- ==========================================================
-- 3. Database Indexes
-- ==========================================================

-- Unique index on tracking_number to optimize shipment search queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);

-- Index on customer_id to speed up customer order lists
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);

-- Index on shipment_status to speed up operational tracking queries
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(shipment_status);
