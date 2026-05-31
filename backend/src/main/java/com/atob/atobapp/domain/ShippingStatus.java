package com.atob.atobapp.domain;

import java.util.Map;
import java.util.Set;

public enum ShippingStatus {
    CREATED,
    ASSIGNED,
    PICKUP_IN_PROGRESS,
    PICKED_UP,
    IN_TRANSIT,
    DELIVERED,
    CANCELLED,
    FAILED;

    private static final Map<ShippingStatus, Set<ShippingStatus>> ALLOWED = Map.of(
            CREATED,            Set.of(ASSIGNED, CANCELLED),
            ASSIGNED,           Set.of(PICKUP_IN_PROGRESS, CANCELLED),
            PICKUP_IN_PROGRESS, Set.of(PICKED_UP, FAILED),
            PICKED_UP,          Set.of(IN_TRANSIT, FAILED),
            IN_TRANSIT,         Set.of(DELIVERED, FAILED),
            DELIVERED,          Set.of(),
            CANCELLED,          Set.of(),
            FAILED,             Set.of()
    );

    public boolean canTransitionTo(ShippingStatus next) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(next);
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED || this == FAILED;
    }
}
