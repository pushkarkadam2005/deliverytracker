package com.lastmile.deliverytracker.common.generator;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class TrackingNumberGenerator {

    // Thread-safe counter — starts at 0 and increments on every call.
    // AtomicLong guarantees correctness under concurrent requests without synchronization.
    private final AtomicLong sequence = new AtomicLong(0);

    /**
     * Generates a unique tracking number in the format:
     * DLT-YYYY-XXXXXXXX
     *
     * Example: DLT-2026-00000001
     */
    public String generate() {
        int year = Year.now().getValue();
        long next = sequence.incrementAndGet();
        // %08d pads the sequence number with leading zeros to a fixed 8-digit width
        return String.format("DLT-%d-%08d", year, next);
    }
}
