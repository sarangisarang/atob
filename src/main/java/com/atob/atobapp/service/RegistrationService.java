package com.atob.atobapp.service;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.TruckDriver;
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

     public Customer signUp(Customer newCustumer) {

     //chack emal address
        if (newCustumer.getEmail() == null){
            throw new RuntimeException("Email address not provided!!!");
        }
        // check of custumer exists this email
        Customer customer = customerRepository.findAllByEmail(newCustumer.getEmail());
        if (customer != null){
            throw new RuntimeException("custumer " + newCustumer.getEmail()+" exists");
            }
        newCustumer.setId(UUID.randomUUID().toString());
        return  customerRepository.save(newCustumer);
        }
    public TruckDriver signUpDriver(TruckDriver newTruckDriver) {
        // chack email address driver
        if (newTruckDriver.getEmail() == null){
            throw  new RuntimeException("Email address not provided!!!");
        }
        //check of driver exists this email
        TruckDriver truckDriver = driverRepository.findAllByEmail(newTruckDriver.getEmail());
        if (truckDriver != null){
            throw new RuntimeException("custumer " + newTruckDriver.getEmail() + " exists");
            }
        newTruckDriver.setId(UUID.randomUUID().toString());
        return driverRepository.save(newTruckDriver);
    }
}