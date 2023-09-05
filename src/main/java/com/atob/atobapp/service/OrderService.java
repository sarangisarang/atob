package com.atob.atobapp.service;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.repository.OrderRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    @Setter
    @Getter
    @Autowired
    private OrderRepository orderRepository;

    public Carrier processing(Carrier newcarrier){
    if()
    }
}
