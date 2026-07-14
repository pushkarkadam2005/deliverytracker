package com.lastmile.deliverytracker.pricing.entity;

import com.lastmile.deliverytracker.common.entity.BaseEntity;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "shipment_charges")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentCharge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One shipment has exactly one charge record.
    // unique = true enforces the 1:1 constraint at the DB level.
    // LAZY loading avoids pulling the full shipment graph on every charge query.
    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Shipment shipment;

    @NotNull
    @PositiveOrZero
    @Column(name = "base_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal baseCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "weight_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal weightCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "fuel_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal fuelCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "cod_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal codCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "gst", precision = 10, scale = 2, nullable = false)
    private BigDecimal gst;

    @NotNull
    @PositiveOrZero
    @Column(name = "discount", precision = 10, scale = 2, nullable = false)
    private BigDecimal discount;

    @NotNull
    @PositiveOrZero
    @Column(name = "total_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalCharge;
}
