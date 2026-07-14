package com.lastmile.deliverytracker.shipment.service;

import com.lastmile.deliverytracker.shipment.dto.request.CreateShipmentRequest;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentResponse;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ShipmentService {

    ShipmentResponse createShipment(CreateShipmentRequest request);

    ShipmentResponse getShipmentByTrackingNumber(String trackingNumber);

    Page<ShipmentSummaryResponse> getMyShipments(Pageable pageable);

    ShipmentResponse cancelShipment(String trackingNumber);

    Page<ShipmentSummaryResponse> getAllShipments(Pageable pageable);

    ShipmentResponse rescheduleShipment(String trackingNumber, java.time.LocalDateTime rescheduledDate);

    ShipmentResponse createShipmentForCustomer(CreateShipmentRequest request, Long customerId);

    Page<ShipmentSummaryResponse> getAllShipmentsFiltered(Pageable pageable, com.lastmile.deliverytracker.shipment.enums.ShipmentStatus status, String zone, Long agentId);

    com.lastmile.deliverytracker.pricing.entity.ShipmentCharge estimateCharges(CreateShipmentRequest request);
}
