package com.lastmile.deliverytracker.shipment.repository;

import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    // Lookup a shipment by its unique tracking number — used in tracking status queries
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    // Retrieve all shipments belonging to a customer (non-paginated) — legacy use
    List<Shipment> findByCustomer(CustomerProfile customer);

    // Paginated retrieval of a customer's own shipments — newest first
    // Used by ShipmentServiceImpl.getMyShipments()
    Page<Shipment> findByCustomerOrderByCreatedAtDesc(CustomerProfile customer, Pageable pageable);

    // Check if a tracking number is already taken before persisting a new shipment
    boolean existsByTrackingNumber(String trackingNumber);

    // Count shipments by status — used by DashboardServiceImpl for metric aggregation
    long countByShipmentStatus(ShipmentStatus shipmentStatus);

    // Paginated listing of all shipments — used by AdminServiceImpl
    @org.springframework.data.jpa.repository.Query(
            value = "SELECT s FROM Shipment s " +
                    "LEFT JOIN FETCH s.customer c " +
                    "LEFT JOIN FETCH c.user u " +
                    "LEFT JOIN FETCH s.shipmentCharge sc",
            countQuery = "SELECT count(s) FROM Shipment s"
    )
    Page<Shipment> findAllForAdmin(Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT DISTINCT s FROM Shipment s " +
                    "LEFT JOIN FETCH s.customer c " +
                    "LEFT JOIN FETCH c.user u " +
                    "LEFT JOIN FETCH s.shipmentCharge sc " +
                    "LEFT JOIN OrderAssignment oa ON oa.shipment = s AND oa.assignmentStatus = 'ASSIGNED' " +
                    "WHERE (:status IS NULL OR s.shipmentStatus = :status) " +
                    "AND (:zone IS NULL OR s.pickupArea.zone.zoneName = :zone OR s.deliveryArea.zone.zoneName = :zone) " +
                    "AND (:agentId IS NULL OR oa.deliveryAgent.id = :agentId)",
            countQuery = "SELECT count(DISTINCT s) FROM Shipment s " +
                         "LEFT JOIN OrderAssignment oa ON oa.shipment = s AND oa.assignmentStatus = 'ASSIGNED' " +
                         "WHERE (:status IS NULL OR s.shipmentStatus = :status) " +
                         "AND (:zone IS NULL OR s.pickupArea.zone.zoneName = :zone OR s.deliveryArea.zone.zoneName = :zone) " +
                         "AND (:agentId IS NULL OR oa.deliveryAgent.id = :agentId)"
    )
    Page<Shipment> findAllFilteredForAdmin(
            @org.springframework.data.repository.query.Param("status") ShipmentStatus status,
            @org.springframework.data.repository.query.Param("zone") String zone,
            @org.springframework.data.repository.query.Param("agentId") Long agentId,
            Pageable pageable
    );

    Page<Shipment> findAll(Pageable pageable);
}

