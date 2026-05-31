package com.atob.atobapp.service;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.DeliveryProofRepository;
import com.atob.atobapp.repository.ShippmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DeliveryProofService {

    private final DeliveryProofRepository proofRepository;
    private final ShippmentRepository shippingRepository;
    private final FileStorageService fileStorageService;

    public DeliveryProofService(DeliveryProofRepository proofRepository,
                                ShippmentRepository shippingRepository,
                                FileStorageService fileStorageService) {
        this.proofRepository    = proofRepository;
        this.shippingRepository = shippingRepository;
        this.fileStorageService = fileStorageService;
    }

    public DeliveryProof getByShipping(String shippingId) {
        return proofRepository.findByShippingId(shippingId)
                .orElseThrow(() -> new BadRequestException("No delivery proof for shipping: " + shippingId));
    }

    @Transactional
    public DeliveryProof submit(String shippingId,
                                String receiverName,
                                String notes,
                                MultipartFile photo) {

        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new BadRequestException("Shipping not found: " + shippingId));

        // Proof is only meaningful once the shipment is delivered
        if (shipping.getShippingStatus() != ShippingStatus.DELIVERED) {
            throw new BadRequestException(
                    "Delivery proof can only be submitted for DELIVERED shipments (current: "
                            + shipping.getShippingStatus() + ")");
        }

        // One proof per shipping
        if (proofRepository.existsByShippingId(shippingId)) {
            throw new BadRequestException("Delivery proof already exists for this shipment");
        }

        if (receiverName == null || receiverName.isBlank()) {
            throw new BadRequestException("Receiver name is required");
        }

        DeliveryProof proof = new DeliveryProof();
        proof.setId(UUID.randomUUID().toString());
        proof.setShipping(shipping);
        proof.setReceiverName(receiverName);
        proof.setNotes(notes);
        proof.setDeliveredAt(LocalDateTime.now());

        // Photo is optional
        if (photo != null && !photo.isEmpty()) {
            String fileId = fileStorageService.save(photo, FileCategory.DELIVERY_PROOF);
            proof.setPhotoFileId(fileId);
        }

        return proofRepository.save(proof);
    }

    public byte[] loadPhoto(String shippingId) {
        DeliveryProof proof = getByShipping(shippingId);
        if (proof.getPhotoFileId() == null) {
            throw new BadRequestException("No photo for this delivery proof");
        }
        return fileStorageService.load(proof.getPhotoFileId());
    }

    public String photoContentType(String shippingId) {
        DeliveryProof proof = getByShipping(shippingId);
        return fileStorageService.contentType(proof.getPhotoFileId());
    }
}
