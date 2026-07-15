-- ==========================================================
-- V5: Notification Domain Schema
-- Table: notifications
-- ==========================================================
-- notifications is an append-only inbox that records every
-- lifecycle event sent to a user about their shipments.
-- Rows are never updated except to flip is_read = true.
-- ==========================================================

-- ==========================================================
-- Table
-- ==========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL           PRIMARY KEY,
    user_id     BIGINT              NOT NULL,
    shipment_id BIGINT,
    type        VARCHAR(50)         NOT NULL,
    title       VARCHAR(200)        NOT NULL,
    message     TEXT                NOT NULL,
    is_read     BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE,
        
    CONSTRAINT chk_notifications_type CHECK (type IN ('SHIPMENT_CREATED', 'PRICE_CALCULATED', 'AGENT_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'))
);

-- ==========================================================
-- Indexes
-- ==========================================================

-- Primary inbox query: all notifications for a user, newest first
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON notifications(user_id);

-- Covering index for the paginated inbox (user + time DESC)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON notifications(user_id, created_at DESC);

-- Unread badge count query: user + is_read filter
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read
    ON notifications(user_id, is_read);

-- Shipment-scoped notification lookup
CREATE INDEX IF NOT EXISTS idx_notifications_shipment_id
    ON notifications(shipment_id);
