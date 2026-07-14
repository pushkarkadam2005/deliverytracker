package com.lastmile.deliverytracker.shipment.mapper;

import com.lastmile.deliverytracker.shipment.dto.request.CreateShipmentRequest;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentResponse;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentSummaryResponse;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ShipmentMapper {

    // Fields populated by the service layer are explicitly ignored here
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "trackingNumber", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "pickupArea", ignore = true)
    @Mapping(target = "deliveryArea", ignore = true)
    @Mapping(target = "volumetricWeight", ignore = true)
    @Mapping(target = "billableWeight", ignore = true)
    @Mapping(target = "shipmentStatus", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shipmentCharge", ignore = true)
    @Mapping(target = "rescheduledDate", ignore = true)
    Shipment toEntity(CreateShipmentRequest request);

    // Full detail mapping for single shipment endpoints
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "agentDetails", ignore = true)
    ShipmentResponse toResponse(Shipment shipment);

    // Minimal mapping for list/summary endpoints
    @Mapping(target = "createdAt", source = "createdAt")
    ShipmentSummaryResponse toSummaryResponse(Shipment shipment);

    // Delegates to toSummaryResponse for each element in the list
    List<ShipmentSummaryResponse> toSummaryResponseList(List<Shipment> shipments);
}
