package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CargoRepository extends JpaRepository<Cargo, String> {
    List<Cargo> findAllByShippingId(String shippingId);
}
