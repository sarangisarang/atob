package com.atob.atobapp.dto;

import com.atob.atobapp.domain.TrackingEvent;

import java.time.LocalDateTime;

public record TrackingEventResponseDTO(
        String id,
        String shippingId,
        Double latitude,
        Double longitude,
        Double speed,
        LocalDateTime recordedAt
) {
    public static TrackingEventResponseDTO from(TrackingEvent e) {
        return new TrackingEventResponseDTO(
                e.getId(),
                e.getShipping() != null ? e.getShipping().getId() : null,
                e.getLatitude(),
                e.getLongitude(),
                e.getSpeed(),
                e.getRecordedAt()
        );
    }
}
