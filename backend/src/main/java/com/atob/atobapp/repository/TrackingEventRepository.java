package com.atob.atobapp.repository;

import com.atob.atobapp.domain.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, String> {
    List<TrackingEvent> findAllByShippingIdOrderByRecordedAtDesc(String shippingId);
}
