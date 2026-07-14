package com.lastmile.deliverytracker.tracking.entity;

import com.lastmile.deliverytracker.common.entity.BaseEntity;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Represents the log of tracking events for a shipment.
 *
 * <p><strong>Design Constraint:</strong> This entity is strictly <strong>append-only</strong>.
 * Historical records must never be updated or deleted. This ensures a reliable, tamper-proof audit
 * trail of all logistical transitions (e.g., PICKED_UP, IN_TRANSIT, DELIVERED) for business accountability,
 * customer visibility, and service level agreement (SLA) reporting.
 */
@Entity
@Table(name = "tracking_histories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_status", nullable = false)
    private ShipmentStatus shipmentStatus;

    @Size(max = 150)
    @Column(name = "location")
    private String location;

    @Size(max = 255)
    @Column(name = "remarks")
    private String remarks;

    @Size(max = 100)
    @Column(name = "actor")
    private String actor;
}
