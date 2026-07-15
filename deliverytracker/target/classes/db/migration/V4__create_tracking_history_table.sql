-- ==========================================================
-- V4: Tracking Domain Schema
-- Table: tracking_histories
-- ==========================================================
-- tracking_histories stores an immutable, append-only log
-- of every status transition a shipment goes through.
-- Each row represents one event (e.g. PICKED_UP, IN_TRANSIT).
-- The current status of a shipment is always the row with
-- the most recent updated_at value for that shipment.
-- ==========================================================

CREATE TABLE IF NOT EXISTS tracking_histories (
    id               BIGSERIAL PRIMARY KEY,
    shipment_id      BIGINT        NOT NULL,
    shipment_status  VARCHAR(50)   NOT NULL,
    location         VARCHAR(150),
    remarks          VARCHAR(255),
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tracking_histories_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE,
        
    CONSTRAINT chk_tracking_status CHECK (shipment_status IN ('CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'))
);

-- ==========================================================
-- Indexes
-- ==========================================================

-- Primary lookup: all history events for a shipment ordered by time
CREATE INDEX IF NOT EXISTS idx_tracking_histories_shipment_id
    ON tracking_histories(shipment_id);

-- Ordered timeline queries (shipment + time ASC / DESC)
CREATE INDEX IF NOT EXISTS idx_tracking_histories_shipment_updated
    ON tracking_histories(shipment_id, updated_at DESC);

-- Status-based filtering (e.g. find all DELIVERED events)
CREATE INDEX IF NOT EXISTS idx_tracking_histories_status
    ON tracking_histories(shipment_status);
