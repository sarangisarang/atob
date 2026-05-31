package com.atob.atobapp.repository;

import com.atob.atobapp.domain.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
    List<ChatConversation> findByCustomerId(String customerId);
    List<ChatConversation> findByDriverId(String driverId);
    Optional<ChatConversation> findByIdAndCustomerId(String id, String customerId);
    Optional<ChatConversation> findByIdAndDriverId(String id, String driverId);
    Optional<ChatConversation> findByShippingId(String shippingId);
}
