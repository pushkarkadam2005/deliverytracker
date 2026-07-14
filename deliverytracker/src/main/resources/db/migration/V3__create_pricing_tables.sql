-- ==========================================================
-- V3: Pricing Domain Schema
-- Tables: zones, areas, rate_cards, shipment_charges
-- ==========================================================

-- ==========================================================
-- 1. zones
-- ==========================================================
CREATE TABLE IF NOT EXISTS zones (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_zones_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_zones_name      ON zones(name);
CREATE INDEX IF NOT EXISTS idx_zones_is_active ON zones(is_active);

-- ==========================================================
-- 2. areas
-- ==========================================================
CREATE TABLE IF NOT EXISTS areas (
    id         BIGSERIAL PRIMARY KEY,
    zone_id    BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL,
    pincode    VARCHAR(10)  NOT NULL,
    city       VARCHAR(100),
    state      VARCHAR(100),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_areas_zone    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE RESTRICT,
    CONSTRAINT uq_areas_pincode UNIQUE (pincode)
);

CREATE INDEX IF NOT EXISTS idx_areas_zone_id   ON areas(zone_id);
CREATE INDEX IF NOT EXISTS idx_areas_pincode   ON areas(pincode);
CREATE INDEX IF NOT EXISTS idx_areas_is_active ON areas(is_active);

-- ==========================================================
-- 3. rate_cards
-- ==========================================================
CREATE TABLE IF NOT EXISTS rate_cards (
    id                 BIGSERIAL PRIMARY KEY,
    pickup_zone_id     BIGINT         NOT NULL,
    delivery_zone_id   BIGINT         NOT NULL,
    minimum_weight     DECIMAL(10, 2) NOT NULL,
    maximum_weight     DECIMAL(10, 2) NOT NULL,
    base_charge        DECIMAL(10, 2) NOT NULL,
    per_kg_rate        DECIMAL(10, 2) NOT NULL,
    cod_charge         DECIMAL(10, 2) NOT NULL,
    fuel_surcharge     DECIMAL(10, 2) NOT NULL,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rate_cards_pickup_zone   FOREIGN KEY (pickup_zone_id)   REFERENCES zones(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rate_cards_delivery_zone FOREIGN KEY (delivery_zone_id) REFERENCES zones(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_rate_cards_pickup_zone    ON rate_cards(pickup_zone_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_delivery_zone  ON rate_cards(delivery_zone_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_is_active      ON rate_cards(is_active);

-- ==========================================================
-- 4. shipment_charges
-- ==========================================================
CREATE TABLE IF NOT EXISTS shipment_charges (
    id             BIGSERIAL PRIMARY KEY,
    shipment_id    BIGINT         NOT NULL,
    base_charge    DECIMAL(10, 2) NOT NULL,
    weight_charge  DECIMAL(10, 2) NOT NULL,
    fuel_charge    DECIMAL(10, 2) NOT NULL,
    cod_charge     DECIMAL(10, 2) NOT NULL,
    gst            DECIMAL(10, 2) NOT NULL,
    discount       DECIMAL(10, 2) NOT NULL,
    total_charge   DECIMAL(10, 2) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_shipment_charges_shipment UNIQUE (shipment_id),
    CONSTRAINT fk_shipment_charges_shipment  FOREIGN KEY (shipment_id)  REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shipment_charges_shipment_id  ON shipment_charges(shipment_id);
