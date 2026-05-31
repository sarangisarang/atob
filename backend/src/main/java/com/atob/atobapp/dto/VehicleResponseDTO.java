package com.atob.atobapp.dto;

import com.atob.atobapp.domain.Vehicle;

public record VehicleResponseDTO(
        String id,
        String plateNumber,
        String vehicleType,
        Double maxWeightKg,
        Double maxVolumeM3,
        boolean active
) {
    public static VehicleResponseDTO from(Vehicle v) {
        if (v == null) return null;
        return new VehicleResponseDTO(
                v.getId(),
                v.getPlateNumber(),
                v.getVehicleType() != null ? v.getVehicleType().name() : null,
                v.getMaxWeightKg(),
                v.getMaxVolumeM3(),
                v.isActive()
        );
    }
}
