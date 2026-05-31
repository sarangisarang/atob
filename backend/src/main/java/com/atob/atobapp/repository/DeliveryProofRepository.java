package com.atob.atobapp.repository;

import com.atob.atobapp.domain.DeliveryProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryProofRepository extends JpaRepository<DeliveryProof, String> {
    Optional<DeliveryProof> findByShippingId(String shippingId);
    boolean existsByShippingId(String shippingId);
}
