package com.atob.atobapp.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Per-driver GPS rate limiter: max 1 update per 10 seconds.
 * In-memory token buckets — no Redis needed for MVP.
 */
@Service
public class TrackingRateLimiter {

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String driverId) {
        return buckets
                .computeIfAbsent(driverId, this::newBucket)
                .tryConsume(1);
    }

    private Bucket newBucket(String key) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(1)
                .refillGreedy(1, Duration.ofSeconds(10))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
