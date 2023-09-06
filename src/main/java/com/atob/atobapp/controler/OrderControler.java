package com.atob.atobapp.controler;

import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.OrderRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("order")
@Setter
@Getter
public class OrderControler {

    @Autowired
    @Getter
    @Setter
    private OrderRepository orderRepository;



    @PostMapping("/newOrder")
    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder){
        return orderRepository.save(transportOrder);
    }

}
