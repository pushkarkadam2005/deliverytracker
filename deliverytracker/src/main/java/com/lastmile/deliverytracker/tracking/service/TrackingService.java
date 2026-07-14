package com.lastmile.deliverytracker.tracking.service;

import com.lastmile.deliverytracker.tracking.dto.request.UpdateTrackingRequest;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingHistoryResponse;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingTimelineResponse;

public interface TrackingService {

    TrackingTimelineResponse getTimeline(String trackingNumber);

    TrackingHistoryResponse updateTracking(String trackingNumber, UpdateTrackingRequest request);

    TrackingHistoryResponse getLatestStatus(String trackingNumber);
}
