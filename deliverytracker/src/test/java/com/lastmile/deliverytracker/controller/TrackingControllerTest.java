package com.lastmile.deliverytracker.controller;

import com.lastmile.deliverytracker.auth.service.CustomUserDetailsService;
import com.lastmile.deliverytracker.auth.service.JwtService;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.tracking.controller.TrackingController;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingTimelineResponse;
import com.lastmile.deliverytracker.tracking.service.TrackingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TrackingController.class)
@DisplayName("TrackingController WebMvc Tests")
class TrackingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TrackingService trackingService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Should return 200 and timeline when tracking history is queried by valid roles")
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void getTimeline_ShouldReturnTimeline() throws Exception {
        // Arrange (AAA - Arrange)
        String trackingNumber = "TRK-12345";
        TrackingTimelineResponse expectedResponse = TrackingTimelineResponse.builder()
                .trackingNumber(trackingNumber)
                .currentStatus(ShipmentStatus.CREATED)
                .history(Collections.emptyList())
                .build();

        when(trackingService.getTimeline(trackingNumber)).thenReturn(expectedResponse);

        // Act (AAA - Act)
        var response = mockMvc.perform(get("/api/v1/tracking/{trackingNumber}", trackingNumber)
                .accept(MediaType.APPLICATION_JSON));

        // Assert (AAA - Assert)
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingNumber").value(trackingNumber))
                .andExpect(jsonPath("$.currentStatus").value("CREATED"));

        verify(trackingService, times(1)).getTimeline(trackingNumber);
    }

    @Test
    @DisplayName("Should return 401 Unauthorized if user is not authenticated")
    void getTimeline_Unauthenticated() throws Exception {
        // Arrange (AAA - Arrange)
        String trackingNumber = "TRK-12345";

        // Act (AAA - Act)
        var response = mockMvc.perform(get("/api/v1/tracking/{trackingNumber}", trackingNumber)
                .accept(MediaType.APPLICATION_JSON));

        // Assert (AAA - Assert)
        response.andExpect(status().isUnauthorized());
        verifyNoInteractions(trackingService);
    }
}
