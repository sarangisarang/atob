package com.atob.atobapp.dto;

import com.atob.atobapp.domain.Shipping;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ShippingResponseDTO(
        String id,
        String transportType,
        String shippingStatus,

        // Driver info (flat — no recursive nesting)
        String carrierId,
        String driverFirstName,
        String driverLastName,

        // Vehicle info (flat)
        String vehicleId,
        String vehiclePlateNumber,
        String vehicleType,

        // Route
        String fromAddress,
        String fromCity,
        String toAddress,
        String toCity,

        // Dates
        LocalDate deliveryStartAt,
        LocalDate deliveryEndAt,

        // Last known GPS
        Double trackingLatitude,
        Double trackingLongitude,

        // Meta
        String notes,
        LocalDateTime updatedAt
) {
    public static ShippingResponseDTO from(Shipping s) {
        String fromAddr = null, fromCity = null, toAddr = null, toCity = null;
        if (s.getOrder() != null) {
            if (s.getOrder().getShippingFrom() != null) {
                fromAddr = s.getOrder().getShippingFrom().getAddress();
                fromCity = s.getOrder().getShippingFrom().getCity();
            }
            if (s.getOrder().getShippingTo() != null) {
                toAddr = s.getOrder().getShippingTo().getAddress();
                toCity = s.getOrder().getShippingTo().getCity();
            }
        }

        return new ShippingResponseDTO(
                s.getId(),
                s.getTransportType()   != null ? s.getTransportType().name()   : null,
                s.getShippingStatus()  != null ? s.getShippingStatus().name()  : null,

                s.getCarrier() != null ? s.getCarrier().getId()        : null,
                s.getCarrier() != null ? s.getCarrier().getFirstName() : null,
                s.getCarrier() != null ? s.getCarrier().getLastName()  : null,

                s.getVehicle() != null ? s.getVehicle().getId()                                       : null,
                s.getVehicle() != null ? s.getVehicle().getPlateNumber()                              : null,
                s.getVehicle() != null && s.getVehicle().getVehicleType() != null
                        ? s.getVehicle().getVehicleType().name() : null,

                fromAddr, fromCity, toAddr, toCity,

                s.getDeliveryStartAt(),
                s.getDeliveryEndAt(),

                s.getTrackingLatitude()  != null ? s.getTrackingLatitude().doubleValue()  : null,
                s.getTrackingLongitude() != null ? s.getTrackingLongitude().doubleValue() : null,

                s.getNotes(),
                s.getUpdatedAt()
        );
    }
}
