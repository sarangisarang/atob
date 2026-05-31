package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Vehicle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findAllByActiveTrue();
    List<Vehicle> findAllByActiveTrue(Pageable pageable);
    List<Vehicle> findAllByCarrierIdAndActiveTrue(String carrierId);
}
