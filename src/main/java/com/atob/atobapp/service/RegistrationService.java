package com.atob.atobapp.service;

import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RegistrationService {
    @Autowired
    private CustomerRepository customerRepository;

    public Customer signUp(Customer newCustumer) {
     //chack emal address
        if (newCustumer.getEmail() == null){
            throw new RuntimeException("Email address not provided");
        }
        // check of custumer exists this email
        Customer customer = customerRepository.findAllByEmail(newCustumer.getEmail());
        if (customer != null){
            throw new RuntimeException("custumer " + newCustumer.getEmail()+" exists");
            }
        newCustumer.setId(UUID.randomUUID().toString());
        return  customerRepository.save(newCustumer);
        }
    }