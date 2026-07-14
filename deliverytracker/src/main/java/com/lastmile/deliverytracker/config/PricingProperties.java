package com.lastmile.deliverytracker.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

/**
 * Configuration properties for pricing settings in the application.
 * Externalizes standard tax and logistics surcharge values.
 */
@Configuration
@ConfigurationProperties(prefix = "pricing")
@Getter
@Setter
public class PricingProperties {

    /**
     * The Goods and Services Tax (GST) rate, defaults to 18.0%.
     */
    private BigDecimal gstPercentage = new BigDecimal("18.0");

    /**
     * The fuel surcharge rate applied to delivery base charges, defaults to 10.0%.
     */
    private BigDecimal fuelSurchargePercentage = new BigDecimal("10.0");
}
