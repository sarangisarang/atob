package com.atob.atobapp.repository;

import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.service.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportOrderRepository extends JpaRepository<TransportOrder, String> {
    List<TransportOrder> findAllByOrderStatus(OrderStatus orderStatus);
}
