package com.atob.atobapp.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ChatConversation {

    @Id
    private String id;

    private String customerId;
    private String driverId;
    @Column(unique = true)
    private String shippingId;

    private boolean active = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
