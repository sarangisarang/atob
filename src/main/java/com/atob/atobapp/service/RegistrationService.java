package com.atob.atobapp.service;

import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.DriverRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RegistrationService {
    @Autowired
    @Setter
    @Getter
    private CustomerRepository customerRepository;
    @Autowired
    @Getter
    @Setter
    private DriverRepository driverRepository;

    public Customer signUp(Customer newCustomer) {

        //chack emal address
        if (newCustomer.getEmail() == null || !newCustomer.getEmail().contains("@")) {
            throw new RuntimeException("Email address not provided!!!");
        }
        // check of custumer exists this email
        Customer customer = customerRepository.findAllByEmail(newCustomer.getEmail());
        if (customer != null) {
            throw new RuntimeException("custumer " + newCustomer.getEmail() + " exists");
        }
        newCustomer.setId(UUID.randomUUID().toString());
        return customerRepository.save(newCustomer);
    }

    public Carrier signUpDriver(Carrier newCarrier) {
        // chack email address driver
        if (newCarrier.getEmail() == null || !newCarrier.getEmail().contains("@")) {
            throw new RuntimeException("Email address not provided!!!");
        }
        //check of driver exists this email
        Carrier carrier = driverRepository.findAllByEmail(newCarrier.getEmail());
        if (carrier != null) {
            throw new RuntimeException("custumer " + newCarrier.getEmail() + " exists");
        }
        newCarrier.setId(UUID.randomUUID().toString());
        return driverRepository.save(newCarrier);
    }

    public Customer updateCustomer(Customer customer, String id) {
        Customer updateCustomer = customerRepository.findById(id).orElseThrow();
        updateCustomer.setCity(customer.getCity());
        updateCustomer.setAddress(customer.getAddress());
        updateCustomer.setEmail(customer.getEmail());
        updateCustomer.setFirstName(customer.getFirstName());
        updateCustomer.setLastName(customer.getLastName());
        updateCustomer.setPassword(customer.getPassword());
        updateCustomer.setPostcode(customer.getPostcode());
        updateCustomer.setPhone(customer.getPhone());
        return customerRepository.save(updateCustomer);
    }
}