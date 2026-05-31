package com.atob.atobapp.service;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.dto.CargoRequestDTO;
import com.atob.atobapp.dto.CargoResponseDTO;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.CargoRepository;
import com.atob.atobapp.repository.ShippmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CargoService {

    private final CargoRepository cargoRepository;
    private final ShippmentRepository shippingRepository;

    public CargoService(CargoRepository cargoRepository,
                        ShippmentRepository shippingRepository) {
        this.cargoRepository   = cargoRepository;
        this.shippingRepository = shippingRepository;
    }

    public List<CargoResponseDTO> findByShipping(String shippingId) {
        return cargoRepository.findAllByShippingId(shippingId)
                .stream()
                .map(CargoResponseDTO::from)
                .toList();
    }

    @Transactional
    public CargoResponseDTO add(String shippingId, CargoRequestDTO req) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new BadRequestException("Shipping not found: " + shippingId));

        if (shipping.getShippingStatus().isTerminal()) {
            throw new BadRequestException("Cannot add cargo to terminal shipment");
        }
        if (req.name() == null || req.name().isBlank()) {
            throw new BadRequestException("Cargo name is required");
        }

        Cargo cargo = new Cargo();
        cargo.setId(UUID.randomUUID().toString());
        cargo.setShipping(shipping);
        cargo.setName(req.name());
        cargo.setDescription(req.description());
        cargo.setWeightKg(req.weightKg());
        cargo.setLengthCm(req.lengthCm());
        cargo.setWidthCm(req.widthCm());
        cargo.setHeightCm(req.heightCm());
        cargo.setVin(req.vin());
        cargo.setPlateNumber(req.plateNumber());
        cargo.setQuantity(req.quantity() != null ? req.quantity() : 1);

        if (req.cargoType() != null) {
            try {
                cargo.setCargoType(CargoType.valueOf(req.cargoType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Unknown cargo type: " + req.cargoType());
            }
        }

        return CargoResponseDTO.from(cargoRepository.save(cargo));
    }

    @Transactional
    public void remove(String cargoId) {
        if (!cargoRepository.existsById(cargoId)) {
            throw new BadRequestException("Cargo not found: " + cargoId);
        }
        cargoRepository.deleteById(cargoId);
    }
}
