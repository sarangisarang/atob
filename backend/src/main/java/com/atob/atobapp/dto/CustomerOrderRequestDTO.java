package com.atob.atobapp.dto;

public record CustomerOrderRequestDTO(
        // Pickup
        String pickupAddress,
        String pickupCity,
        String pickupPostcode,
        String pickupPhone,
        // Delivery
        String deliveryAddress,
        String deliveryCity,
        String deliveryPostcode,
        String deliveryPhone,
        // Transport + cargo
        String transportType,   // LIGHT | TRUCK | TRAILER
        String cargoType,       // GENERAL_GOODS | VEHICLE | ...
        String cargoName,
        String cargoDescription,
        Double weightKg,
        Integer quantity,
        // Meta
        String shippingDate,    // yyyy-MM-dd
        String notes
) {}
