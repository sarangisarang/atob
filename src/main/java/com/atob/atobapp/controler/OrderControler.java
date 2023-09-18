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


    @PostMapping("/newOrder/{customer_id}")
    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder,@PathVariable("customer_id") String Customer_id){
        return orderService.newOrders(transportOrder,Customer_id);
    }

    @GetMapping("/order")
    public List<TransportOrder> getAllOrders(){
        return orderRepository.findAll();
    }

    @GetMapping("/order/{id}")
    public TransportOrder getOrder(@PathVariable String id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @PostMapping("/order/shipping")
    public Shipping creatShipping(@RequestBody Shipping shipping){
        return shippmentRepository.save(shipping);
    }
    @GetMapping("order/shipping")
    public  List<Shipping> showShipping(){
        return shippmentRepository.findAll();
    }
    @PutMapping("/order/shipping/{id}")
    public Shipping updateOrder(@RequestBody Shipping shipping,@PathVariable String id){
        return shippingService.updateOrder(shipping,id);
    }
}