package com.lastmile.deliverytracker.pricing.repository;

import com.lastmile.deliverytracker.pricing.entity.ShipmentCharge;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ShipmentChargeRepository extends JpaRepository<ShipmentCharge, Long> {

    // Lookup by parent shipment — used by PricingServiceImpl after saving
    Optional<ShipmentCharge> findByShipment(Shipment shipment);

    // Aggregate total revenue across all shipment charges
    @Query("SELECT COALESCE(SUM(sc.totalCharge), 0) FROM ShipmentCharge sc")
    BigDecimal sumTotalRevenue();
}
