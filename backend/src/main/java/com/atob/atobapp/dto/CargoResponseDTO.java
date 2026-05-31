package com.atob.atobapp.dto;

import com.atob.atobapp.domain.Cargo;

public record CargoResponseDTO(
        String id,
        String shippingId,
        String name,
        String description,
        String cargoType,
        Double weightKg,
        Double lengthCm,
        Double widthCm,
        Double heightCm,
        String vin,
        String plateNumber,
        Integer quantity
) {
    public static CargoResponseDTO from(Cargo c) {
        return new CargoResponseDTO(
                c.getId(),
                c.getShipping() != null ? c.getShipping().getId() : null,
                c.getName(),
                c.getDescription(),
                c.getCargoType() != null ? c.getCargoType().name() : null,
                c.getWeightKg(),
                c.getLengthCm(),
                c.getWidthCm(),
                c.getHeightCm(),
                c.getVin(),
                c.getPlateNumber(),
                c.getQuantity()
        );
    }
}
