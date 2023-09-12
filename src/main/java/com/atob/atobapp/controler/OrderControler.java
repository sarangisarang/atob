package com.atob.atobapp.controler;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.OrderRepository;
import com.atob.atobapp.service.OrderService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("show")
public class OrderControler {
    @Autowired
    private OrderService orderService;
    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/newOrder/{costomerId}")
    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder){
        return orderRepository.save(transportOrder);
    }

    @GetMapping("/order")
    public List<TransportOrder> getAllOrders(){
        return orderRepository.findAll();
    }

    @GetMapping("/order/{id}")
    public TransportOrder getOrder(@PathVariable String id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @PostMapping("/order/{CustomerId}")
    public TransportOrder saveOrder(@RequestBody TransportOrder transportOrder,@PathVariable String CustomerId){
        return orderService.saveOrder(transportOrder,CustomerId);
    }
}