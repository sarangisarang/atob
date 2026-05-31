package com.atob.atobapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Proof of Delivery — one record per shipping (UNIQUE).
 * photoFileId points to a StoredFile via FileStorageService.
 */
@Entity
@Table(name = "delivery_proof")
@Getter
@Setter
public class DeliveryProof {

    @Id
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_id", nullable = false, unique = true)
    private Shipping shipping;

    @Column(name = "receiver_name")
    private String receiverName;

    @Column(name = "photo_file_id")
    private String photoFileId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
