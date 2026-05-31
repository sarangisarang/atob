package com.atob.atobapp.controler;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.ServiceUser;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.DriverRepository;
import com.atob.atobapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private CustomerRepository customerRepository;

    @GetMapping("/me")
    public Map<String, String> getMe(Principal principal) {
        ServiceUser user = userRepository.findUserByUsername(principal.getName())
                .orElseThrow();

        String role = user.getRoles().stream()
                .map(r -> r.getRoleName().replace("ROLE_", ""))
                .findFirst()
                .orElse("UNKNOWN");

        Map<String, String> result = new HashMap<>();
        result.put("username", user.getUsername());
        result.put("role", role);

        if ("DRIVER".equals(role)) {
            Carrier carrier = driverRepository.findAllByEmail(user.getUsername());
            if (carrier != null) {
                result.put("carrierId", carrier.getId());
                result.put("firstName", carrier.getFirstName());
                result.put("lastName",  carrier.getLastName());
            }
        } else if ("CUSTOMER".equals(role)) {
            Customer customer = customerRepository.findAllByEmail(user.getUsername());
            if (customer != null) {
                result.put("customerId", customer.getId());
                result.put("firstName",  customer.getFirstName());
                result.put("lastName",   customer.getLastName());
            }
        }

        return result;
    }
}
