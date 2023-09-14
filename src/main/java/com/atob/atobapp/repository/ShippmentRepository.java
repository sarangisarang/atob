package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Shippment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippmentRepository extends JpaRepository<Shippment,String> {
}
