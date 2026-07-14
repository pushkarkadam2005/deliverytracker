package com.lastmile.deliverytracker.assignment.strategy;

import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.shipment.entity.Shipment;

import java.util.List;
import java.util.Optional;

/**
 * Strategy interface defining delivery agent selection algorithms.
 * Allows pluggable assignment rules (e.g. nearest agent, lowest workload agent, etc.).
 */
public interface AssignmentStrategy {

    /**
     * Selects the most appropriate delivery agent from a list of candidates.
     *
     * @param shipment the shipment order to assign
     * @param candidates the list of candidate delivery agents
     * @return the selected delivery agent, wrapped in an Optional
     */
    Optional<DeliveryAgent> selectAgent(Shipment shipment, List<DeliveryAgent> candidates);
}
