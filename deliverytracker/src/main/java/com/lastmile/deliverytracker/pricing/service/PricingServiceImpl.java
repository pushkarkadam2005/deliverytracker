package com.lastmile.deliverytracker.pricing.service;

import com.lastmile.deliverytracker.pricing.calculator.PricingCalculator;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.pricing.entity.RateCard;
import com.lastmile.deliverytracker.pricing.entity.ShipmentCharge;
import com.lastmile.deliverytracker.pricing.entity.Zone;
import com.lastmile.deliverytracker.pricing.repository.AreaRepository;
import com.lastmile.deliverytracker.pricing.repository.RateCardRepository;
import com.lastmile.deliverytracker.pricing.repository.ShipmentChargeRepository;
import com.lastmile.deliverytracker.pricing.exception.AreaNotFoundException;
import com.lastmile.deliverytracker.pricing.exception.RateCardNotFoundException;
import com.lastmile.deliverytracker.shipment.enums.OrderType;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation orchestrating pricing calculations.
 * Responsible for loading spatial regions and matching rate cards, then delegating math to the calculator.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PricingServiceImpl implements PricingService {

    private static final Logger log = LoggerFactory.getLogger(PricingServiceImpl.class);

    private final AreaRepository areaRepository;
    private final RateCardRepository rateCardRepository;
    private final ShipmentChargeRepository shipmentChargeRepository;
    private final PricingCalculator pricingCalculator;

    @Override
    public ShipmentCharge calculateShipmentCharges(Shipment shipment) {
        log.debug("Initiating pricing orchestration for shipment: {}", shipment.getTrackingNumber());

        String pickupPincode = shipment.getPickupPincode();
        String deliveryPincode = shipment.getDeliveryPincode();

        // 1. Fetch Area and Zone details for the pickup location (re-uses pre-resolved references to prevent duplicate query scans)
        Area pickupArea = shipment.getPickupArea();
        if (pickupArea == null) {
            pickupArea = areaRepository.findByPincode(pickupPincode)
                    .orElseThrow(() -> new AreaNotFoundException("Pickup area not found for pincode: " + pickupPincode));
        }
        Zone pickupZone = pickupArea.getZone();

        // 2. Fetch Area and Zone details for the delivery location (re-uses pre-resolved references to prevent duplicate query scans)
        Area deliveryArea = shipment.getDeliveryArea();
        if (deliveryArea == null) {
            deliveryArea = areaRepository.findByPincode(deliveryPincode)
                    .orElseThrow(() -> new AreaNotFoundException("Delivery area not found for pincode: " + deliveryPincode));
        }
        Zone deliveryZone = deliveryArea.getZone();

        // 3. Calculate volumetric and billable weight to look up correct rate card
        BigDecimal volumetricWeight = BigDecimal.ZERO;
        if (shipment.getLength() != null && shipment.getWidth() != null && shipment.getHeight() != null) {
            volumetricWeight = shipment.getLength()
                    .multiply(shipment.getWidth())
                    .multiply(shipment.getHeight())
                    .divide(new BigDecimal("5000"), 2, RoundingMode.HALF_UP);
        }
        shipment.setVolumetricWeight(volumetricWeight);

        BigDecimal actualWeight = shipment.getActualWeight() != null ? shipment.getActualWeight() : BigDecimal.ZERO;
        BigDecimal billableWeight = actualWeight.max(volumetricWeight);
        shipment.setBillableWeight(billableWeight);

        OrderType orderType = shipment.getOrderType() != null ? shipment.getOrderType() : OrderType.B2C;

        RateCard rateCard = rateCardRepository.findRateCard(pickupZone, deliveryZone, orderType, billableWeight)
                .orElseThrow(() -> new RateCardNotFoundException(
                        "Active rate card not found between pickup zone " + pickupZone.getZoneName() +
                                " and delivery zone " + deliveryZone.getZoneName() +
                                " for order type " + orderType + " and weight " + billableWeight));

        // 4. Delegate computation to calculator strategy
        ShipmentCharge shipmentCharge = pricingCalculator.calculate(shipment, rateCard);

        // 5. Persist calculation snapshot
        ShipmentCharge savedCharge = shipmentChargeRepository.save(shipmentCharge);
        log.debug("Shipment charges saved successfully for shipment tracking: {}", shipment.getTrackingNumber());

        return savedCharge;
    }
}

