package com.atob.atobapp.controler;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.DriverRepository;
import com.atob.atobapp.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/register")
public class DriverRegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DriverRepository driverRepository;

    @PostMapping("/signUpCustomer")
    public Customer signUpCustomer(@RequestBody Customer newCustomer) {
        return registrationService.signUp(newCustomer);
    }

    @PostMapping("/signUpDriver")
    public Carrier signUpDriver(@RequestBody Carrier newCarrier) {
        return registrationService.signUpDriver(newCarrier);
    }

    @GetMapping("/customers")
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/drivers")
    public List<Carrier> getAllDrivers() {
        return driverRepository.findAll();
    }

    @PutMapping("/customer/{id}")
    public Customer updateCustomer(@RequestBody Customer customer, @PathVariable String id) {
        return registrationService.updateCustomer(customer, id);
    }
}
