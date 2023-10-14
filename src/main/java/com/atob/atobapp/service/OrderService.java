package com.atob.atobapp.service;

import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.TransportOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class OrderService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private TransportOrderRepository transportOrderRepository;

    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder, String CustomerId) {
        transportOrder.setId(UUID.randomUUID().toString());
        Customer customer = customerRepository.findById(CustomerId).orElseThrow();
        transportOrder.setCustomer(customer);
        transportOrder.setStatusService(StatusService.Pending);
        return transportOrderRepository.save(transportOrder);
    }

    // 1.1 , 1.2
    public TransportOrder updateOrder(TransportOrder transportOrder, String id) {
        TransportOrder ordersToUpdate = transportOrderRepository.findById(id).orElseThrow();
        if (ordersToUpdate.getStatusService() != StatusService.Pending) {
            throw new BadRequestException("Not allowed to update  order");
        }
        ordersToUpdate.setOrderId(transportOrder.getOrderId());
        ordersToUpdate.setOrderNo(transportOrder.getOrderNo());
        ordersToUpdate.setOrderDate(transportOrder.getOrderDate());
        ordersToUpdate.setShippingDate(transportOrder.getShippingDate());
        ordersToUpdate.setDeliveredDate(transportOrder.getDeliveredDate());
        return transportOrderRepository.save(ordersToUpdate);
    }

    // 2.1 , 2.2
    public TransportOrder updateOrderStatusProcessing(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getStatusService() != StatusService.Pending) {
            throw new BadRequestException("Invaled status");
        }
        transportOrder.setStatusService(StatusService.Processing);
        return transportOrderRepository.save(transportOrder);
    }

    // 3.1 , 3.2
    public TransportOrder updateOrderStatusWaitingCarrier(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getStatusService() != StatusService.Processing) {
            throw new BadRequestException("Invaled status");
        }
        transportOrder.setStatusService(StatusService.WaitingCarrier);
        return transportOrderRepository.save(transportOrder);
    }

    // 4.1 , 4.2
    public TransportOrder updateOrderStatusShippet(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getStatusService() != StatusService.WaitingCarrier){
            throw new BadRequestException("Invaled status");
        }
        transportOrder.setStatusService(StatusService.Shippet);
        transportOrder.setShippingDate(LocalDate.now());
        return transportOrderRepository.save(transportOrder);
    }

    // 5.1 , 5.2
    public TransportOrder updateOrderStatusDelivered(String id) {
        TransportOrder transportOrder = transportOrderRepository.findById(id).orElseThrow();
        if (transportOrder.getStatusService() != StatusService.Shippet) {
            throw new BadRequestException("Invaled status");
        }
        transportOrder.setStatusService(StatusService.Delivered);
        transportOrder.setDeliveredDate(LocalDate.now());
        return transportOrderRepository.save(transportOrder);

    }
}


