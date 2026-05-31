package com.atob.atobapp.service;

import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.TransportOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransportOrderRepository transportOrderRepository;

    public TransportOrder newOrders(TransportOrder transportOrder, String customerId) {
        transportOrder.setId(UUID.randomUUID().toString());
        Customer customer = customerRepository.findById(customerId).orElseThrow();
        transportOrder.setCustomer(customer);
        transportOrder.setOrderStatus(OrderStatus.Pending);
        return transportOrderRepository.save(transportOrder);
    }

    public TransportOrder updateOrder(TransportOrder transportOrder, String id) {
        TransportOrder ordersToUpdate = transportOrderRepository.findById(id).orElseThrow();
        if (ordersToUpdate.getOrderStatus() != OrderStatus.Pending) {
            throw new BadRequestException("Not allowed to update order when status is not Pending");
        }
        ordersToUpdate.setOrderId(transportOrder.getOrderId());
        ordersToUpdate.setOrderNo(transportOrder.getOrderNo());
        ordersToUpdate.setOrderDate(transportOrder.getOrderDate());
        ordersToUpdate.setShippingDate(transportOrder.getShippingDate());
        ordersToUpdate.setDeliveredDate(transportOrder.getDeliveredDate());
        return transportOrderRepository.save(ordersToUpdate);
    }

    public TransportOrder updateOrderStatusProcessing(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getOrderStatus() != OrderStatus.Pending) {
            throw new BadRequestException("Order must be in Pending status to move to Processing");
        }
        transportOrder.setOrderStatus(OrderStatus.Processing);
        return transportOrderRepository.save(transportOrder);
    }

    public TransportOrder updateOrderStatusWaitingCarrier(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getOrderStatus() != OrderStatus.Processing) {
            throw new BadRequestException("Order must be in Processing status to move to WaitingCarrier");
        }
        transportOrder.setOrderStatus(OrderStatus.WaitingCarrier);
        return transportOrderRepository.save(transportOrder);
    }

    public TransportOrder updateOrderStatusShipped(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getOrderStatus() != OrderStatus.WaitingCarrier) {
            throw new BadRequestException("Order must be in WaitingCarrier status to move to Shipped");
        }
        transportOrder.setOrderStatus(OrderStatus.Shipped);
        transportOrder.setShippingDate(LocalDate.now());
        return transportOrderRepository.save(transportOrder);
    }

    public TransportOrder updateOrderStatusDelivered(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getOrderStatus() != OrderStatus.Shipped) {
            throw new BadRequestException("Order must be in Shipped status to move to Delivered");
        }
        transportOrder.setOrderStatus(OrderStatus.Delivered);
        transportOrder.setDeliveredDate(LocalDate.now());
        return transportOrderRepository.save(transportOrder);
    }

    public TransportOrder cancelOrder(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getOrderStatus() != OrderStatus.Pending) {
            throw new BadRequestException("Only Pending orders can be cancelled");
        }
        transportOrder.setOrderStatus(OrderStatus.Cancelled);
        return transportOrderRepository.save(transportOrder);
    }

    public List<TransportOrder> getOrdersByStatus(OrderStatus status) {
        return transportOrderRepository.findAllByOrderStatus(status);
    }
}
