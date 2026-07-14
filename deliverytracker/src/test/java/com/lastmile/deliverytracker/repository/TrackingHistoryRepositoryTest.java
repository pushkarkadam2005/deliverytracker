package com.lastmile.deliverytracker.repository;

import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.enums.Role;
import com.lastmile.deliverytracker.config.AbstractBaseIntegrationTest;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Tag("integration")
@DisplayName("TrackingHistoryRepository Integration Tests")
class TrackingHistoryRepositoryTest extends AbstractBaseIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TrackingHistoryRepository trackingHistoryRepository;

    private Shipment shipment;

    @BeforeEach
    void setUp() {
        // Arrange base data
        User user = User.builder()
                .fullName("John Customer")
                .email("john.cust@example.com")
                .password("securepassword")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        user = entityManager.persist(user);

        CustomerProfile customerProfile = CustomerProfile.builder()
                .user(user)
                .phone("1234567890")
                .defaultAddress("123 Street")
                .build();
        customerProfile = entityManager.persist(customerProfile);

        // Fetch seeded areas to satisfy NOT NULL constraints in test DB
        Area pickupArea = entityManager.getEntityManager()
                .createQuery("SELECT a FROM Area a WHERE a.pincode = '110001'", Area.class)
                .getSingleResult();
        Area deliveryArea = entityManager.getEntityManager()
                .createQuery("SELECT a FROM Area a WHERE a.pincode = '110002'", Area.class)
                .getSingleResult();

        shipment = Shipment.builder()
                .trackingNumber("TRK-12345")
                .customer(customerProfile)
                .pickupArea(pickupArea)
                .deliveryArea(deliveryArea)
                .pickupAddress("Warehouse A")
                .deliveryAddress("Office B")
                .pickupPincode("110001")
                .deliveryPincode("110002")
                .receiverName("Jane Receiver")
                .receiverPhone("9876543210")
                .actualWeight(BigDecimal.valueOf(2.5))
                .paymentType(PaymentType.PREPAID)
                .shipmentStatus(ShipmentStatus.CREATED)
                .build();
        shipment = entityManager.persist(shipment);
    }

    @Test
    @DisplayName("Should find tracking history ordered by update time ascending")
    void findByShipmentOrderByUpdatedAtAsc() {
        // Arrange (AAA - Arrange)
        TrackingHistory event1 = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.CREATED)
                .location("Delhi Hub")
                .remarks("Shipment registered")
                .build();

        TrackingHistory event2 = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Delhi Hub")
                .remarks("Shipment picked up by agent")
                .build();

        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.flush();

        // Act (AAA - Act)
        List<TrackingHistory> result = trackingHistoryRepository.findByShipmentOrderByUpdatedAtAsc(shipment);

        // Assert (AAA - Assert)
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getShipmentStatus()).isEqualTo(ShipmentStatus.CREATED);
        assertThat(result.get(1).getShipmentStatus()).isEqualTo(ShipmentStatus.PICKED_UP);
    }

    @Test
    @DisplayName("Should find latest tracking status by desc update time")
    void findTopByShipmentOrderByUpdatedAtDesc() {
        // Arrange (AAA - Arrange)
        TrackingHistory event1 = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.CREATED)
                .location("Delhi Hub")
                .remarks("Shipment registered")
                .build();

        TrackingHistory event2 = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.PICKED_UP)
                .location("Delhi Hub")
                .remarks("Shipment picked up by agent")
                .build();

        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.flush();

        // Act (AAA - Act)
        Optional<TrackingHistory> result = trackingHistoryRepository.findTopByShipmentOrderByUpdatedAtDesc(shipment);

        // Assert (AAA - Assert)
        assertThat(result).isPresent();
        assertThat(result.get().getShipmentStatus()).isEqualTo(ShipmentStatus.PICKED_UP);
    }
}
