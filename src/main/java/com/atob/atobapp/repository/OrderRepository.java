package com.atob.atobapp.repository;
import com.atob.atobapp.domain.TruckOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<TruckOrder,String> {
}
