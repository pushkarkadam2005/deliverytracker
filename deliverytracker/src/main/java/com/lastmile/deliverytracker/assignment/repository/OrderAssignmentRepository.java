package com.lastmile.deliverytracker.assignment.repository;

import com.lastmile.deliverytracker.assignment.entity.AssignmentStatus;
import com.lastmile.deliverytracker.assignment.entity.OrderAssignment;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderAssignmentRepository extends JpaRepository<OrderAssignment, Long> {

    // Used by AssignmentServiceImpl to persist new assignments
    // (inherited from JpaRepository.save())

    // Count active (non-completed) assignments for a given agent
    // Used by AdminServiceImpl to populate activeAssignments in AgentAdminResponse
    long countByDeliveryAgentAndAssignmentStatus(DeliveryAgent deliveryAgent, AssignmentStatus status);

    @Query("SELECT oa.deliveryAgent.id, COUNT(oa) FROM OrderAssignment oa " +
           "WHERE oa.deliveryAgent IN :agents AND oa.assignmentStatus = :status " +
           "GROUP BY oa.deliveryAgent.id")
    List<Object[]> countActiveAssignmentsForAgents(@Param("agents") List<DeliveryAgent> agents, @Param("status") AssignmentStatus status);

    // All assignments for a given agent — used if full history is needed
    List<OrderAssignment> findByDeliveryAgent(DeliveryAgent deliveryAgent);

    java.util.Optional<OrderAssignment> findByShipmentAndAssignmentStatus(com.lastmile.deliverytracker.shipment.entity.Shipment shipment, AssignmentStatus status);

    java.util.List<OrderAssignment> findByShipment(com.lastmile.deliverytracker.shipment.entity.Shipment shipment);
}
