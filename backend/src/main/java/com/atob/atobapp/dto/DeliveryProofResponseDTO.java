package com.atob.atobapp.dto;

import com.atob.atobapp.domain.DeliveryProof;

import java.time.LocalDateTime;

public record DeliveryProofResponseDTO(
        String id,
        String shippingId,
        String receiverName,
        String photoFileId,
        boolean hasPhoto,
        String notes,
        LocalDateTime deliveredAt,
        LocalDateTime createdAt
) {
    public static DeliveryProofResponseDTO from(DeliveryProof p) {
        return new DeliveryProofResponseDTO(
                p.getId(),
                p.getShipping() != null ? p.getShipping().getId() : null,
                p.getReceiverName(),
                p.getPhotoFileId(),
                p.getPhotoFileId() != null,
                p.getNotes(),
                p.getDeliveredAt(),
                p.getCreatedAt()
        );
    }
}
