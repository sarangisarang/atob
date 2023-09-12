package com.atob.atobapp.controler;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("register")
public class DriverRegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/signUp")
    public Customer signUp(@RequestBody Customer newCustumer){
        return registrationService.signUp(newCustumer);
    }

    @PostMapping("/signUpDriver")
    public Carrier signUpDriver(@RequestBody Carrier newCarrier){
        return  registrationService.signUpDriver(newCarrier);
    }
}
