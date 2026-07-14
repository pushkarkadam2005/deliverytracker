package com.lastmile.deliverytracker.pricing.entity;

import com.lastmile.deliverytracker.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "areas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Area extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String areaName;

    @NotBlank
    @Size(max = 10)
    @Column(name = "pincode", length = 10, nullable = false, unique = true)
    private String pincode;

    @Size(max = 100)
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 100)
    @Column(name = "state", length = 100)
    private String state;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Many areas belong to one zone.
    // LAZY loading avoids fetching the zone on every area query.
    // @JoinColumn maps to the zone_id foreign key column in the areas table.
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
}
