package com.lastmile.deliverytracker.pricing.calculator;

import com.lastmile.deliverytracker.config.PricingProperties;
import com.lastmile.deliverytracker.pricing.entity.RateCard;
import com.lastmile.deliverytracker.pricing.entity.ShipmentCharge;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Dedicated pricing calculator component to decouple calculation algorithms from orchestration services.
 * Calculates shipment costs based on active rate cards, billable weights, and tax percentages.
 */
@Component
@RequiredArgsConstructor
public class PricingCalculator {

    private static final Logger log = LoggerFactory.getLogger(PricingCalculator.class);
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final PricingProperties pricingProperties;

    /**
     * Computes all shipment charge components and returns a build-ready ShipmentCharge.
     *
     * @param shipment the shipment order to calculate costs for
     * @param rateCard the matching active zone rate card to use
     * @return the calculated ShipmentCharge entity
     */
    public BigDecimal calculateVolumetricWeight(Shipment shipment) {
        if (shipment == null || shipment.getLength() == null || shipment.getWidth() == null || shipment.getHeight() == null) {
            return BigDecimal.ZERO;
        }
        return shipment.getLength()
                .multiply(shipment.getWidth())
                .multiply(shipment.getHeight())
                .divide(new BigDecimal("5000"), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateBillableWeight(Shipment shipment) {
        if (shipment == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal volumetric = shipment.getVolumetricWeight() != null ? shipment.getVolumetricWeight() : calculateVolumetricWeight(shipment);
        BigDecimal actual = shipment.getActualWeight() != null ? shipment.getActualWeight() : BigDecimal.ZERO;
        return actual.max(volumetric);
    }

    public ShipmentCharge calculate(Shipment shipment, RateCard rateCard) {
        log.debug("Initiating pricing calculation logic for tracking: {}", shipment.getTrackingNumber());

        BigDecimal volumetricWeight = calculateVolumetricWeight(shipment);
        shipment.setVolumetricWeight(volumetricWeight);

        BigDecimal billableWeight = calculateBillableWeight(shipment);
        shipment.setBillableWeight(billableWeight);

        PaymentType paymentType = shipment.getPaymentType();

        // 1. Base Charge
        BigDecimal baseCharge = rateCard.getBaseCharge();

        // 2. Weight Charge = billableWeight * pricePerKg
        BigDecimal weightCharge = billableWeight.multiply(rateCard.getPricePerKg())
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Fuel Surcharge = baseCharge * rateCard.getFuelSurcharge() / 100
        BigDecimal fuelSurchargeFactor = rateCard.getFuelSurcharge().divide(HUNDRED, 4, RoundingMode.HALF_UP);
        BigDecimal fuelCharge = baseCharge.multiply(fuelSurchargeFactor)
                .setScale(2, RoundingMode.HALF_UP);

        // 4. COD Charge
        BigDecimal codCharge = (paymentType == PaymentType.COD)
                ? rateCard.getCodCharge()
                : BigDecimal.ZERO;

        // 5. GST = (baseCharge + weightCharge + fuelCharge + codCharge) * gstPercentage
        BigDecimal subTotal = baseCharge.add(weightCharge).add(fuelCharge).add(codCharge);
        BigDecimal gstFactor = pricingProperties.getGstPercentage().divide(HUNDRED, 4, RoundingMode.HALF_UP);
        BigDecimal gst = subTotal.multiply(gstFactor)
                .setScale(2, RoundingMode.HALF_UP);

        // 6. Discount (Not applied in default flow)
        BigDecimal discount = BigDecimal.ZERO;

        // 7. Total Charge = subTotal + GST - Discount
        BigDecimal totalCharge = subTotal.add(gst).subtract(discount)
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("Pricing details calculated - Base: {}, Weight: {}, Fuel: {}, COD: {}, GST: {}, Total: {}",
                baseCharge, weightCharge, fuelCharge, codCharge, gst, totalCharge);

        return ShipmentCharge.builder()
                .shipment(shipment)
                .baseCharge(baseCharge)
                .weightCharge(weightCharge)
                .fuelCharge(fuelCharge)
                .codCharge(codCharge)
                .gst(gst)
                .discount(discount)
                .totalCharge(totalCharge)
                .build();
    }
}
