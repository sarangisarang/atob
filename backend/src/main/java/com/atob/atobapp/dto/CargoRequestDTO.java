package com.atob.atobapp.dto;

public record CargoRequestDTO(
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
) {}
