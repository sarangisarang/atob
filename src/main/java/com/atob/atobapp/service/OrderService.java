package com.atob.atobapp.service;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.OrderRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Service
@Setter
@Getter
public class OrderService {
    @Autowired
    @Setter
    @Getter
    private CustomerRepository customerRepository;
    @Autowired
    @Setter
    @Getter
    private OrderRepository orderRepository;

    public TransportOrder createSaveOrders(@RequestBody TransportOrder transportOrder, String CustomerId) {
        transportOrder.setId(UUID.randomUUID().toString());
        Customer customer = customerRepository.findById(CustomerId).orElseThrow();
        transportOrder.setCustomer(customer);
        return orderRepository.save(transportOrder);
    }
}
