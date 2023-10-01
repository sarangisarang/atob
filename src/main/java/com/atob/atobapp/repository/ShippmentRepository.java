package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippmentRepository extends JpaRepository<Shipping, String> {
}
