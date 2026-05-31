package com.atob.atobapp.repository;
import com.atob.atobapp.domain.ServiceUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<ServiceUser, String> {

    // Eager-fetch roles so callers can read them outside a transaction.
    // Required because prod runs spring.jpa.open-in-view=false — a plain lazy
    // collection would throw LazyInitializationException in controllers/security.
    @Query("SELECT DISTINCT u FROM ServiceUser u LEFT JOIN FETCH u.roles WHERE u.username = :username")
    Optional<ServiceUser> findUserByUsername(@Param("username") String username);
}
