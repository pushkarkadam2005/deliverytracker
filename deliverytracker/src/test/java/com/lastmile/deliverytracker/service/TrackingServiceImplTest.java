package com.lastmile.deliverytracker.service;

import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.exception.ShipmentNotFoundException;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.tracking.dto.request.UpdateTrackingRequest;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingHistoryResponse;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.mapper.TrackingMapper;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import com.lastmile.deliverytracker.tracking.service.TrackingServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrackingServiceImpl Unit Tests")
class TrackingServiceImplTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private TrackingHistoryRepository trackingHistoryRepository;

    @Mock
    private TrackingMapper trackingMapper;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private TrackingServiceImpl trackingService;

    @Test
    @DisplayName("Should successfully update tracking status and return response")
    void updateTracking_Success() {
        // Arrange (AAA - Arrange)
        String trackingNumber = "TRK-12345";
        UpdateTrackingRequest request = UpdateTrackingRequest.builder()
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Delhi Hub")
                .remarks("Picked up from sender")
                .build();

        Shipment shipment = Shipment.builder()
                .trackingNumber(trackingNumber)
                .shipmentStatus(ShipmentStatus.CREATED)
                .build();

        TrackingHistory savedHistory = TrackingHistory.builder()
                .id(1L)
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Delhi Hub")
                .remarks("Picked up from sender")
                .build();

        TrackingHistoryResponse expectedResponse = TrackingHistoryResponse.builder()
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Delhi Hub")
                .remarks("Picked up from sender")
                .build();

        when(shipmentRepository.findByTrackingNumber(trackingNumber)).thenReturn(Optional.of(shipment));
        when(trackingHistoryRepository.save(any(TrackingHistory.class))).thenReturn(savedHistory);
        when(trackingMapper.toResponse(savedHistory)).thenReturn(expectedResponse);

        // Act (AAA - Act)
        TrackingHistoryResponse result = trackingService.updateTracking(trackingNumber, request);

        // Assert (AAA - Assert)
        assertThat(result).isNotNull();
        assertThat(result.getShipmentStatus()).isEqualTo(ShipmentStatus.PICKED_UP);
        assertThat(shipment.getShipmentStatus()).isEqualTo(ShipmentStatus.PICKED_UP);

        verify(shipmentRepository, times(1)).findByTrackingNumber(trackingNumber);
        verify(shipmentRepository, times(1)).save(shipment);
        verify(trackingHistoryRepository, times(1)).save(any(TrackingHistory.class));
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test
    @DisplayName("Should throw ShipmentNotFoundException when updating non-existent shipment")
    void updateTracking_ShipmentNotFound() {
        // Arrange (AAA - Arrange)
        String trackingNumber = "TRK-99999";
        UpdateTrackingRequest request = UpdateTrackingRequest.builder()
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .build();

        when(shipmentRepository.findByTrackingNumber(trackingNumber)).thenReturn(Optional.empty());

        // Act & Assert (AAA - Act & Assert)
        assertThatThrownBy(() -> trackingService.updateTracking(trackingNumber, request))
                .isInstanceOf(ShipmentNotFoundException.class)
                .hasMessageContaining("Shipment not found with tracking number: " + trackingNumber);

        verify(shipmentRepository, times(1)).findByTrackingNumber(trackingNumber);
        verifyNoInteractions(trackingHistoryRepository);
    }
}
