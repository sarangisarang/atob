package com.atob.atobapp.controler;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.OrderRepository;
import com.atob.atobapp.service.OrderService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


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

 /*   @PostMapping("/order/{CustomerId}")
    public TransportOrder saveOrders(@RequestBody TransportOrder transportOrder, @PathVariable String CustomerId){
        return OrderService.createSaveOrders(transportOrder,CustomerId);
    }*/
}
