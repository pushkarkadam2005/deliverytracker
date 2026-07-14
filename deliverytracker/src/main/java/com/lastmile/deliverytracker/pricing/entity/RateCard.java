package com.lastmile.deliverytracker.pricing.entity;

import com.lastmile.deliverytracker.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import com.lastmile.deliverytracker.shipment.enums.OrderType;
import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateCard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_zone_id", nullable = false)
    private Zone pickupZone;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_zone_id", nullable = false)
    private Zone deliveryZone;

    @NotNull
    @PositiveOrZero
    @Column(name = "minimum_weight", precision = 10, scale = 2, nullable = false)
    private BigDecimal minimumWeight;

    @NotNull
    @PositiveOrZero
    @Column(name = "maximum_weight", precision = 10, scale = 2, nullable = false)
    private BigDecimal maximumWeight;

    @NotNull
    @PositiveOrZero
    @Column(name = "base_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal baseCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "per_kg_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerKg;

    @NotNull
    @PositiveOrZero
    @Column(name = "cod_charge", precision = 10, scale = 2, nullable = false)
    private BigDecimal codCharge;

    @NotNull
    @PositiveOrZero
    @Column(name = "fuel_surcharge", precision = 10, scale = 2, nullable = false)
    private BigDecimal fuelSurcharge;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType;
}
