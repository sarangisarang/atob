package com.atob.atobapp.service;

import com.atob.atobapp.domain.Carrier;
import com.atob.atobapp.domain.Customer;
import com.atob.atobapp.domain.ServiceUser;
import com.atob.atobapp.domain.UserRole;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.CustomerRepository;
import com.atob.atobapp.repository.DriverRepository;
import com.atob.atobapp.repository.UserRepository;
import com.atob.atobapp.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RegistrationService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(CustomerRepository customerRepository,
                               DriverRepository driverRepository,
                               UserRepository userRepository,
                               UserRoleRepository userRoleRepository,
                               PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.driverRepository   = driverRepository;
        this.userRepository     = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder    = passwordEncoder;
    }

    // ─── Customer ──────────────────────────────────────────────────────────────

    @Transactional
    public Customer signUp(Customer newCustomer) {
        String email = normalizeEmail(newCustomer.getEmail());
        validatePassword(newCustomer.getPassword());
        assertEmailFree(email);

        String encoded = passwordEncoder.encode(newCustomer.getPassword());

        // Login credentials (source of truth for auth)
        createServiceUser(email, encoded, "ROLE_CUSTOMER");

        // Profile record — store the SAME encoded password, never plain text
        newCustomer.setId(UUID.randomUUID().toString());
        newCustomer.setEmail(email);
        newCustomer.setPassword(encoded);
        return customerRepository.save(newCustomer);
    }

    // ─── Driver ────────────────────────────────────────────────────────────────

    @Transactional
    public Carrier signUpDriver(Carrier newCarrier) {
        String email = normalizeEmail(newCarrier.getEmail());
        validatePassword(newCarrier.getPassword());
        assertEmailFree(email);

        String encoded = passwordEncoder.encode(newCarrier.getPassword());

        createServiceUser(email, encoded, "ROLE_DRIVER");

        newCarrier.setId(UUID.randomUUID().toString());
        newCarrier.setEmail(email);
        newCarrier.setPassword(encoded);
        return driverRepository.save(newCarrier);
    }

    public Customer updateCustomer(Customer customer, String id) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Customer not found"));
        existing.setCity(customer.getCity());
        existing.setAddress(customer.getAddress());
        existing.setFirstName(customer.getFirstName());
        existing.setLastName(customer.getLastName());
        existing.setPostcode(customer.getPostcode());
        existing.setPhone(customer.getPhone());
        // email/password changes go through dedicated flows — not edited here
        return customerRepository.save(existing);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void createServiceUser(String email, String encodedPassword, String role) {
        ServiceUser su = new ServiceUser();
        su.setId(UUID.randomUUID().toString());
        su.setUsername(email);
        su.setPassword(encodedPassword);
        userRepository.save(su);

        UserRole ur = new UserRole();
        ur.setId(UUID.randomUUID().toString());
        ur.setRoleName(role);
        ur.setUser(su);
        userRoleRepository.save(ur);
    }

    private String normalizeEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new BadRequestException("Valid email address is required");
        }
        return email.trim().toLowerCase();
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new BadRequestException(
                    "Password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
    }

    private void assertEmailFree(String email) {
        if (userRepository.findUserByUsername(email).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (customerRepository.findAllByEmail(email) != null
                || driverRepository.findAllByEmail(email) != null) {
            throw new BadRequestException("An account with this email already exists");
        }
    }
}
