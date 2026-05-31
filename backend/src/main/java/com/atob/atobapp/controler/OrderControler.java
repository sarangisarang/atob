package com.atob.atobapp.controler;

import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.TransportOrderRepository;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/show")
public class OrderControler {

    @Autowired
    private OrderService orderService;

    @Autowired
    private TransportOrderRepository transportOrderRepository;

    @GetMapping("/orders")
    public List<TransportOrder> getAllOrders(@RequestParam(required = false) String status) {
        if (status != null) {
            return orderService.getOrdersByStatus(OrderStatus.valueOf(status));
        }
        return transportOrderRepository.findAll();
    }

    @GetMapping("/order/{id}")
    public TransportOrder getOrder(@PathVariable String id) {
        return transportOrderRepository.findById(id).orElseThrow();
    }

    @PostMapping("/order/{customerId}")
    public TransportOrder newOrder(@RequestBody TransportOrder transportOrder,
                                   @PathVariable String customerId) {
        return orderService.newOrders(transportOrder, customerId);
    }

    @PutMapping("/order/{id}")
    public TransportOrder updateOrder(@RequestBody TransportOrder transportOrder,
                                      @PathVariable String id) {
        return orderService.updateOrder(transportOrder, id);
    }

    @PutMapping("/order/{id}/processing")
    public TransportOrder updateOrderStatusProcessing(@PathVariable String id) {
        return orderService.updateOrderStatusProcessing(id);
    }

    @PutMapping("/order/{id}/waitingCarrier")
    public TransportOrder updateOrderStatusWaitingCarrier(@PathVariable String id) {
        return orderService.updateOrderStatusWaitingCarrier(id);
    }

    @PutMapping("/order/{id}/shipped")
    public TransportOrder updateOrderStatusShipped(@PathVariable String id) {
        return orderService.updateOrderStatusShipped(id);
    }

    @PutMapping("/order/{id}/delivered")
    public TransportOrder updateOrderStatusDelivered(@PathVariable String id) {
        return orderService.updateOrderStatusDelivered(id);
    }

    @PutMapping("/order/{id}/cancel")
    public TransportOrder cancelOrder(@PathVariable String id) {
        return orderService.cancelOrder(id);
    }
}
