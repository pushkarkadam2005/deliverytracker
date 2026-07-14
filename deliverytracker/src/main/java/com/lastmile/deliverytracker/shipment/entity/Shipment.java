package com.lastmile.deliverytracker.shipment.entity;

import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.common.entity.BaseEntity;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.shipment.enums.OrderType;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "tracking_number", length = 50, nullable = false, unique = true)
    private String trackingNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerProfile customer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_area_id", nullable = false)
    private Area pickupArea;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_area_id", nullable = false)
    private Area deliveryArea;

    @NotBlank
    @Column(name = "pickup_address", columnDefinition = "TEXT", nullable = false)
    private String pickupAddress;

    @NotBlank
    @Column(name = "delivery_address", columnDefinition = "TEXT", nullable = false)
    private String deliveryAddress;

    @NotBlank
    @Size(max = 10)
    @Column(name = "pickup_pincode", length = 10, nullable = false)
    private String pickupPincode;

    @NotBlank
    @Size(max = 10)
    @Column(name = "delivery_pincode", length = 10, nullable = false)
    private String deliveryPincode;

    @NotBlank
    @Size(max = 100)
    @Column(name = "receiver_name", length = 100, nullable = false)
    private String receiverName;

    @NotBlank
    @Size(max = 15)
    @Column(name = "receiver_phone", length = 15, nullable = false)
    private String receiverPhone;

    @NotNull
    @Positive
    @Column(name = "actual_weight", precision = 10, scale = 2, nullable = false)
    private BigDecimal actualWeight;

    @Positive
    @Column(name = "volumetric_weight", precision = 10, scale = 2)
    private BigDecimal volumetricWeight;

    @Positive
    @Column(name = "billable_weight", precision = 10, scale = 2)
    private BigDecimal billableWeight;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_status", nullable = false)
    private ShipmentStatus shipmentStatus = ShipmentStatus.CREATED;

    @OneToOne(mappedBy = "shipment", fetch = FetchType.LAZY)
    private com.lastmile.deliverytracker.pricing.entity.ShipmentCharge shipmentCharge;

    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType;

    @Column(name = "rescheduled_date")
    private java.time.LocalDateTime rescheduledDate;
}
