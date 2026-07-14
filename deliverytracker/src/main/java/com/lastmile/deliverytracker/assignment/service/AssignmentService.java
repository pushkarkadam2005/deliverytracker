package com.lastmile.deliverytracker.assignment.service;

import com.lastmile.deliverytracker.assignment.entity.OrderAssignment;
import com.lastmile.deliverytracker.shipment.entity.Shipment;

public interface AssignmentService {
    OrderAssignment assignShipment(Shipment shipment);
}
