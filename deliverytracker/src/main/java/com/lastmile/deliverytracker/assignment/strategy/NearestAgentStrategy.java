package com.lastmile.deliverytracker.assignment.strategy;

import com.lastmile.deliverytracker.assignment.calculator.DistanceCalculator;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Strategy implementation assigning the nearest available delivery agent.
 * Employs a coordinate distance calculation relative to the pickup location coordinates.
 */
@Component
@RequiredArgsConstructor
public class NearestAgentStrategy implements AssignmentStrategy {

    private static final Logger log = LoggerFactory.getLogger(NearestAgentStrategy.class);

    private final DistanceCalculator distanceCalculator;

    @Override
    public Optional<DeliveryAgent> selectAgent(Shipment shipment, List<DeliveryAgent> candidates) {
        log.debug("Selecting nearest delivery agent for shipment: {}", shipment.getTrackingNumber());

        // Retrieve coordinates from pickup area (fallback to 0.0 if not defined)
        double shipmentLat = 0.0;
        double shipmentLng = 0.0;
        if (shipment.getPickupArea() != null && shipment.getPickupArea().getLatitude() != null && shipment.getPickupArea().getLongitude() != null) {
            shipmentLat = shipment.getPickupArea().getLatitude().doubleValue();
            shipmentLng = shipment.getPickupArea().getLongitude().doubleValue();
        }

        DeliveryAgent nearestAgent = null;
        double minDistance = Double.MAX_VALUE;

        for (DeliveryAgent agent : candidates) {
            double agentLat = (agent.getCurrentLatitude() != null) ? agent.getCurrentLatitude() : 0.0;
            double agentLng = (agent.getCurrentLongitude() != null) ? agent.getCurrentLongitude() : 0.0;

            double distance = distanceCalculator.calculateDistance(shipmentLat, shipmentLng, agentLat, agentLng);

            if (distance < minDistance) {
                minDistance = distance;
                nearestAgent = agent;
            }
        }

        return Optional.ofNullable(nearestAgent);
    }
}
