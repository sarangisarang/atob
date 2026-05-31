package com.atob.atobapp.controler;

import com.atob.atobapp.dto.CustomerOrderRequestDTO;
import com.atob.atobapp.dto.ShippingResponseDTO;
import com.atob.atobapp.service.CustomerOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    // Authenticated customer creates an order; customer resolved from the token,
    // never from a path param (no spoofing another customer).
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShippingResponseDTO create(@RequestBody CustomerOrderRequestDTO req, Principal principal) {
        return customerOrderService.create(principal.getName(), req);
    }
}
