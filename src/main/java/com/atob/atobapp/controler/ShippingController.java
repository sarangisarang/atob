package com.atob.atobapp.controler;


import com.atob.atobapp.domain.Shipping;
import com.atob.atobapp.repository.ShippmentRepository;
import com.atob.atobapp.service.ShippingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/Shipping")
public class ShippingController {
    @Autowired
    private ShippmentRepository shippmentRepository;
    @Autowired
    private ShippingService shippingService;


    @PostMapping("/create")
    public Shipping creatShipping(@RequestBody Shipping shipping){
        return shippingService.creatShipping(shipping);
    }

    @GetMapping("order/shipping")
    public List<Shipping> showShipping(){
        return shippmentRepository.findAll();
    }

    @PutMapping("/order/shipping/{id}")
    public Shipping updateShipping(@RequestBody Shipping shipping,@PathVariable String id){
        return shippingService.updateShipping(shipping,id);
    }
    @PutMapping("/shipping/{shipping_id}/tracking/{attitude}/{longitude}")
    public Shipping updateCordinad(@PathVariable String shipping_id, @PathVariable BigDecimal attitude, @PathVariable BigDecimal longitude){
        return shippingService.updateCoordinate(shipping_id,attitude,longitude);
    }
}
