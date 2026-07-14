package com.lastmile.deliverytracker.tracking.repository;

import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {

    List<TrackingHistory> findByShipmentOrderByUpdatedAtAsc(Shipment shipment);

    Optional<TrackingHistory> findTopByShipmentOrderByUpdatedAtDesc(Shipment shipment);
}
