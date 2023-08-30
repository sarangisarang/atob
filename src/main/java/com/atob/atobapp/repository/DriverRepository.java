package com.atob.atobapp.repository;
import com.atob.atobapp.domain.TruckDriver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<TruckDriver,String> {
    TruckDriver findAllByEmail(String email);
}
