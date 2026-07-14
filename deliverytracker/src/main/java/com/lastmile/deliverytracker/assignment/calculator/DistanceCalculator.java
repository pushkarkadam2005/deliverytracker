package com.lastmile.deliverytracker.assignment.calculator;

import org.springframework.stereotype.Component;

/**
 * Calculator component for distance estimations.
 * Computes standard straight-line distance (Euclidean metric) between coordinates.
 */
@Component
public class DistanceCalculator {

    /**
     * Calculates the Euclidean distance between two 2D points.
     *
     * @param x1 x-coordinate of first point (latitude)
     * @param y1 y-coordinate of first point (longitude)
     * @param x2 x-coordinate of second point (latitude)
     * @param y2 y-coordinate of second point (longitude)
     * @return the calculated straight-line distance
     */
    public double calculateDistance(double x1, double y1, double x2, double y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}
