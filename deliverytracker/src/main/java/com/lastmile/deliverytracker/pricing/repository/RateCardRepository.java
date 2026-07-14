package com.lastmile.deliverytracker.pricing.repository;

import com.lastmile.deliverytracker.pricing.entity.RateCard;
import com.lastmile.deliverytracker.pricing.entity.Zone;
import com.lastmile.deliverytracker.shipment.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {

    // Used by PricingServiceImpl to find the active rate between two zones
    Optional<RateCard> findByPickupZoneAndDeliveryZoneAndActiveTrue(Zone pickupZone, Zone deliveryZone);

    @Query("SELECT r FROM RateCard r WHERE r.pickupZone = :pickupZone AND r.deliveryZone = :deliveryZone AND r.orderType = :orderType AND r.minimumWeight <= :weight AND r.maximumWeight >= :weight AND r.active = true")
    Optional<RateCard> findRateCard(
            @Param("pickupZone") Zone pickupZone,
            @Param("deliveryZone") Zone deliveryZone,
            @Param("orderType") OrderType orderType,
            @Param("weight") BigDecimal weight
    );

    // Used by AdminServiceImpl for paginated rate card listing
    @Override
    @EntityGraph(attributePaths = {"pickupZone", "deliveryZone"})
    Page<RateCard> findAll(Pageable pageable);
}
