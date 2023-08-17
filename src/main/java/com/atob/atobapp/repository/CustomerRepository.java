package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer,String>{
    Customer findAllByEmail(String email);
}
