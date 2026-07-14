package com.lastmile.deliverytracker.admin.service;

import com.lastmile.deliverytracker.admin.dto.response.DashboardResponse;

public interface DashboardService {

    /**
     * Aggregates platform-wide metrics into a single snapshot.
     * All counts are computed in real-time from existing repositories.
     * No business logic — purely a read aggregation.
     */
    DashboardResponse getDashboard();
}
