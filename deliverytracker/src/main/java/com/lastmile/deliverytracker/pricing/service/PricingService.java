package com.lastmile.deliverytracker.pricing.service;

import com.lastmile.deliverytracker.pricing.entity.ShipmentCharge;
import com.lastmile.deliverytracker.shipment.entity.Shipment;

public interface PricingService {
    ShipmentCharge calculateShipmentCharges(Shipment shipment);
}
