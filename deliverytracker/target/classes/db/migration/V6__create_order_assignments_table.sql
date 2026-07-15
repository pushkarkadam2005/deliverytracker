-- V6: Create order_assignments table
CREATE TABLE order_assignments (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    delivery_agent_id BIGINT NOT NULL,
    assignment_status VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT fk_order_assignments_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id),
    CONSTRAINT fk_order_assignments_agent FOREIGN KEY (delivery_agent_id) REFERENCES delivery_agents(id)
);

CREATE INDEX idx_order_assignments_shipment ON order_assignments(shipment_id);
CREATE INDEX idx_order_assignments_agent ON order_assignments(delivery_agent_id);
