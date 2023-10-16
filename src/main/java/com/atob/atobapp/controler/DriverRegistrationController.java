package com.atob.atobapp.controler;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("register")
public class DriverRegistrationController {

    @Autowired
    private RegistrationService registrationService;
    @Autowired
    private CustomerRepository customerRepository;


    @PostMapping("/signUpCustomer")
    public Customer signUp(@RequestBody Customer newCustumer) {
        return registrationService.signUp(newCustumer);
    }

    @GetMapping("/customers") // 26.10.2023  new show me all Customers
    public List<Customer> getAllCostumers() {
        return customerRepository.findAll();
    }

    @PutMapping("/customer/{id}") // 26.10.2023 new made this
    public Customer updateCostumer(@RequestBody Customer customer, @PathVariable String id) {
        return registrationService.updateCostomer(customer, id);
    }

    @PostMapping("/signUpDriver")
    public Carrier signUpDriver(@RequestBody Carrier newCarrier) {
        return registrationService.signUpDriver(newCarrier);
    }

}
