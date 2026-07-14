package com.lastmile.deliverytracker.pricing.repository;

import com.lastmile.deliverytracker.pricing.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
}
