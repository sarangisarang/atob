package com.atob.atobapp.controler;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("orderstatus")
public class OrderControler {
    @Autowired
    private OrderService orderService;

    @PostMapping("/processing")
    public Carrier processing(@RequestBody Carrier newCarrier){
        return orderService.processing(newCarrier);
    }

}
