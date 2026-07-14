package com.lastmile.deliverytracker.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.enums.Role;
import com.lastmile.deliverytracker.auth.repository.CustomerProfileRepository;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import com.lastmile.deliverytracker.config.AbstractBaseIntegrationTest;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.pricing.repository.AreaRepository;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import com.lastmile.deliverytracker.tracking.dto.request.UpdateTrackingRequest;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Tag("integration")
@DisplayName("Tracking System Integration Tests")
class TrackingIntegrationTest extends AbstractBaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private TrackingHistoryRepository trackingHistoryRepository;

    @Autowired
    private AreaRepository areaRepository;

    private Shipment shipment;

    @BeforeEach
    void setUp() {
        // Arrange (AAA - Arrange)
        User user = User.builder()
                .fullName("Alice Customer")
                .email("alice.cust@example.com")
                .password("supersecure")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        CustomerProfile customerProfile = CustomerProfile.builder()
                .user(user)
                .phone("9999999999")
                .defaultAddress("Warehouse 1")
                .build();
        customerProfile = customerProfileRepository.save(customerProfile);

        // Fetch seeded areas from DB (seeded via V7 Flyway script)
        Area pickupArea = areaRepository.findByPincode("110001")
                .orElseThrow(() -> new IllegalStateException("Test area 110001 not found"));
        Area deliveryArea = areaRepository.findByPincode("110002")
                .orElseThrow(() -> new IllegalStateException("Test area 110002 not found"));

        shipment = Shipment.builder()
                .trackingNumber("TRK-INTEGRATION-001")
                .customer(customerProfile)
                .pickupArea(pickupArea)
                .deliveryArea(deliveryArea)
                .pickupAddress("Warehouse 1")
                .deliveryAddress("Store 2")
                .pickupPincode("110001")
                .deliveryPincode("110002")
                .receiverName("Bob Receiver")
                .receiverPhone("8888888888")
                .actualWeight(BigDecimal.valueOf(5.0))
                .paymentType(PaymentType.COD)
                .shipmentStatus(ShipmentStatus.CREATED)
                .build();
        shipment = shipmentRepository.save(shipment);
    }

    @Test
    @DisplayName("Should update tracking status, persist to database, and return in timeline")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testUpdateTrackingAndRetrieveTimeline_EndToEnd() throws Exception {
        // Arrange (AAA - Arrange)
        UpdateTrackingRequest updateRequest = UpdateTrackingRequest.builder()
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Transit Hub A")
                .remarks("Arrived at transit facility")
                .build();

        // Act (AAA - Act Part 1: Update status via POST)
        var postResponse = mockMvc.perform(post("/api/v1/tracking/{trackingNumber}", shipment.getTrackingNumber())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)));

        // Assert (AAA - Assert Part 1)
        postResponse.andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus").value("PICKED_UP"))
                .andExpect(jsonPath("$.location").value("Transit Hub A"));

        // Act (AAA - Act Part 2: Fetch timeline via GET)
        var getResponse = mockMvc.perform(get("/api/v1/tracking/{trackingNumber}", shipment.getTrackingNumber())
                .accept(MediaType.APPLICATION_JSON));

        // Assert (AAA - Assert Part 2)
        getResponse.andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingNumber").value(shipment.getTrackingNumber()))
                .andExpect(jsonPath("$.currentStatus").value("PICKED_UP"))
                .andExpect(jsonPath("$.history").isArray())
                .andExpect(jsonPath("$.history[0].shipmentStatus").value("PICKED_UP"))
                .andExpect(jsonPath("$.history[0].location").value("Transit Hub A"));

        // Direct DB Verification
        Shipment updatedShipment = shipmentRepository.findByTrackingNumber(shipment.getTrackingNumber()).orElseThrow();
        assertThat(updatedShipment.getShipmentStatus()).isEqualTo(ShipmentStatus.PICKED_UP);
        assertThat(trackingHistoryRepository.findByShipmentOrderByUpdatedAtAsc(updatedShipment)).hasSize(1);
    }
}
