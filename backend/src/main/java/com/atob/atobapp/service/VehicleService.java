package com.atob.atobapp.service;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Vehicle;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.DriverRepository;
import com.atob.atobapp.repository.VehicleRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          DriverRepository driverRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository  = driverRepository;
    }

    public List<Vehicle> findAllActive() {
        return vehicleRepository.findAllByActiveTrue();
    }

    public List<Vehicle> findAllActive(Pageable pageable) {
        return vehicleRepository.findAllByActiveTrue(pageable);
    }

    public Vehicle findById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Vehicle not found: " + id));
    }

    @Transactional
    public Vehicle create(Vehicle vehicle) {
        if (vehicle.getPlateNumber() == null || vehicle.getPlateNumber().isBlank()) {
            throw new BadRequestException("Plate number is required");
        }
        if (vehicle.getVehicleType() == null) {
            throw new BadRequestException("Vehicle type is required");
        }

        if (vehicle.getCarrier() != null && vehicle.getCarrier().getId() != null) {
            Carrier carrier = driverRepository.findById(vehicle.getCarrier().getId())
                    .orElseThrow(() -> new BadRequestException("Carrier not found"));
            vehicle.setCarrier(carrier);
        }

        vehicle.setId(UUID.randomUUID().toString());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle update(String id, Vehicle update) {
        Vehicle existing = findById(id);
        existing.setPlateNumber(update.getPlateNumber());
        existing.setVehicleType(update.getVehicleType());
        existing.setMaxWeightKg(update.getMaxWeightKg());
        existing.setMaxVolumeM3(update.getMaxVolumeM3());
        return vehicleRepository.save(existing);
    }

    @Transactional
    public void deactivate(String id) {
        Vehicle existing = findById(id);
        existing.setActive(false);
        vehicleRepository.save(existing);
    }
}
