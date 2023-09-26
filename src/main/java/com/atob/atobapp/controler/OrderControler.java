package com.atob.atobapp.controler;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.TransportOrderRepository;
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
    private TransportOrderRepository transportOrderRepository;
    @Autowired
    private ShippingService shippingService;
    @Autowired
    private ShippmentRepository shippmentRepository;
    @Autowired
    private CustomerRepository customerRepository;


    @GetMapping("/orders")
    public List<TransportOrder> getAllOrders() {
        return transportOrderRepository.findAll();
    }

    @GetMapping("/order/{id}")
    public TransportOrder getOrder(@PathVariable String id) {
        return transportOrderRepository.findById(id).orElseThrow();
    }

    @PostMapping("/Order/{customerid}")
    public TransportOrder newOrders(@RequestBody TransportOrder transportOrder, @PathVariable("customerid") String Customerid) {
        return orderService.newOrders(transportOrder, Customerid);
    }

    @PutMapping("/order/{id}") // new made 26.10.2023
    public TransportOrder updateOrder(@RequestBody TransportOrder transportOrder, @PathVariable String id) {
        return orderService.createUpdateOrder(transportOrder, id);
    }

    // @DeleteMapping  habe ich eine frage.

}
