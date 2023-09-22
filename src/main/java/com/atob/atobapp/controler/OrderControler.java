package com.atob.atobapp.controler;
import com.atob.atobapp.domain.Shipping;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.OrderRepository;
import com.atob.atobapp.repository.ShippmentRepository;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.ShippingService;
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
    @Autowired
    private ShippingService shippingService;
    @Autowired
    private ShippmentRepository shippmentRepository;


    @PostMapping("/newOrder/{customerid}")
    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder,@PathVariable("customer_id") String Customerid){
        return orderService.newOrders(transportOrder,Customerid);
    }

    @GetMapping("/order")
    public List<TransportOrder> getAllOrders(){
        return orderRepository.findAll();
    }

    @GetMapping("/order/{id}")
    public TransportOrder getOrder(@PathVariable String id) {
        return orderRepository.findById(id).orElseThrow();
    }

}