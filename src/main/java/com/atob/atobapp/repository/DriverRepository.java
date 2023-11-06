package com.atob.atobapp.repository;
import com.atob.atobapp.domain.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Carrier, String> {
    Carrier findAllByEmail(String email);
}
