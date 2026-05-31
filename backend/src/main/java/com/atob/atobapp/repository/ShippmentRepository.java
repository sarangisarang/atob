package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Shipping;
import com.atob.atobapp.domain.ShippingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippmentRepository extends JpaRepository<Shipping, String> {
    // Driver sees only their assigned shippings
    List<Shipping> findAllByCarrierEmail(String email);
    List<Shipping> findAllByCarrierEmail(String email, Pageable pageable);

    // Customer sees only their own shippings
    List<Shipping> findAllByOrderCustomerEmail(String email);
    List<Shipping> findAllByOrderCustomerEmail(String email, Pageable pageable);

    // Filter by status
    List<Shipping> findAllByShippingStatus(ShippingStatus status);

    // Find by order id (for OrderDetailScreen)
    java.util.Optional<Shipping> findByOrderId(String orderId);
}
