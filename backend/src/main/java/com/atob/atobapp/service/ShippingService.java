package com.atob.atobapp.service;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ShippingService {

    private final ShippmentRepository shippingRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final TrackingEventRepository trackingEventRepository;

    public ShippingService(ShippmentRepository shippingRepository,
                           DriverRepository driverRepository,
                           VehicleRepository vehicleRepository,
                           TrackingEventRepository trackingEventRepository) {
        this.shippingRepository       = shippingRepository;
        this.driverRepository         = driverRepository;
        this.vehicleRepository        = vehicleRepository;
        this.trackingEventRepository  = trackingEventRepository;
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public Shipping createShipping(Shipping shipping) {
        shipping.setId(UUID.randomUUID().toString());
        shipping.setShippingStatus(ShippingStatus.CREATED);
        shipping.setUpdatedAt(LocalDateTime.now());
        return shippingRepository.save(shipping);
    }

    // ─── Assignment ───────────────────────────────────────────────────────────

    @Transactional
    public Shipping assignDriver(String shippingId, String carrierId) {
        Shipping shipping = findById(shippingId);

        if (shipping.getShippingStatus().isTerminal()) {
            throw new BadRequestException(
                    "Cannot assign driver to terminal shipment: " + shipping.getShippingStatus());
        }

        Carrier carrier = driverRepository.findById(carrierId)
                .orElseThrow(() -> new BadRequestException("Driver not found: " + carrierId));

        shipping.setCarrier(carrier);

        if (shipping.getShippingStatus() == ShippingStatus.CREATED) {
            validateAndTransition(shipping, ShippingStatus.ASSIGNED);
        }

        shipping.setUpdatedAt(LocalDateTime.now());
        return shippingRepository.save(shipping);
    }

    @Transactional
    public Shipping assignVehicle(String shippingId, String vehicleId) {
        Shipping shipping = findById(shippingId);

        if (shipping.getShippingStatus().isTerminal()) {
            throw new BadRequestException(
                    "Cannot assign vehicle to terminal shipment: " + shipping.getShippingStatus());
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BadRequestException("Vehicle not found: " + vehicleId));

        // ASSIGNED requires a driver — vehicle assignment alone does not change status
        shipping.setVehicle(vehicle);
        shipping.setUpdatedAt(LocalDateTime.now());
        return shippingRepository.save(shipping);
    }

    // ─── Status transitions ───────────────────────────────────────────────────

    @Transactional
    public Shipping startPickup(String shippingId) {
        return transition(shippingId, ShippingStatus.PICKUP_IN_PROGRESS);
    }

    @Transactional
    public Shipping pickUp(String shippingId) {
        return transition(shippingId, ShippingStatus.PICKED_UP);
    }

    @Transactional
    public Shipping startTransit(String shippingId) {
        return transition(shippingId, ShippingStatus.IN_TRANSIT);
    }

    @Transactional
    public Shipping deliver(String shippingId) {
        return transition(shippingId, ShippingStatus.DELIVERED);
    }

    @Transactional
    public Shipping cancel(String shippingId) {
        return transition(shippingId, ShippingStatus.CANCELLED);
    }

    @Transactional
    public Shipping markFailed(String shippingId) {
        return transition(shippingId, ShippingStatus.FAILED);
    }

    // ─── GPS ─────────────────────────────────────────────────────────────────

    @Transactional
    public Shipping updateCoordinates(String shippingId, BigDecimal latitude, BigDecimal longitude) {
        Shipping shipping = findById(shippingId);

        shipping.setTrackingLatitude(latitude);
        shipping.setTrackingLongitude(longitude);
        shipping.setUpdatedAt(LocalDateTime.now());

        TrackingEvent event = new TrackingEvent();
        event.setId(UUID.randomUUID().toString());
        event.setShipping(shipping);
        event.setCarrier(shipping.getCarrier());
        event.setLatitude(latitude.doubleValue());
        event.setLongitude(longitude.doubleValue());
        event.setRecordedAt(LocalDateTime.now());
        trackingEventRepository.save(event);

        return shippingRepository.save(shipping);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public Shipping updateShipping(Shipping update, String id) {
        Shipping existing = findById(id);

        if (existing.getShippingStatus().isTerminal()) {
            throw new BadRequestException("Cannot update terminal shipment");
        }

        existing.setDeliveryStartAt(update.getDeliveryStartAt());
        existing.setDeliveryEndAt(update.getDeliveryEndAt());
        existing.setNotes(update.getNotes());
        existing.setTransportType(update.getTransportType());
        existing.setUpdatedAt(LocalDateTime.now());
        return shippingRepository.save(existing);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Shipping transition(String shippingId, ShippingStatus next) {
        Shipping shipping = findById(shippingId);
        validateAndTransition(shipping, next);
        shipping.setUpdatedAt(LocalDateTime.now());
        return shippingRepository.save(shipping);
    }

    private void validateAndTransition(Shipping shipping, ShippingStatus next) {
        ShippingStatus current = shipping.getShippingStatus();
        if (!current.canTransitionTo(next)) {
            throw new BadRequestException(
                    "Invalid transition: " + current + " → " + next);
        }
        shipping.setShippingStatus(next);
    }

    private Shipping findById(String id) {
        return shippingRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Shipping not found: " + id));
    }
}
