package com.atob.atobapp.service;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Service
public class OrderService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private OrderRepository orderRepository;

   public TransportOrder saveOrder(@RequestBody TransportOrder transportOrder, String CustomerId) {
        transportOrder.setId(UUID.randomUUID().toString());
        Customer customer = customerRepository.findById(CustomerId).orElseThrow();
        transportOrder.setCustomer(customer);
        return orderRepository.save(transportOrder);
    }
}
