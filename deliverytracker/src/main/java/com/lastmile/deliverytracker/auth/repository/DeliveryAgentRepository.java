package com.lastmile.deliverytracker.auth.repository;

import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<DeliveryAgent> findByAvailabilityStatus(AvailabilityStatus availabilityStatus);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Page<DeliveryAgent> findAll(Pageable pageable);
}
