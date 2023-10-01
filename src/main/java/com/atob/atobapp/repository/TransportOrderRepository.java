package com.atob.atobapp.repository;

import com.atob.atobapp.domain.TransportOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportOrderRepository extends JpaRepository<TransportOrder, String> {
}
