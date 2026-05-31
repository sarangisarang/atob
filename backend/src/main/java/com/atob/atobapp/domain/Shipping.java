package com.atob.atobapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Shipping {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_type", nullable = false, length = 30)
    private TransportType transportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status", nullable = false, length = 40)
    private ShippingStatus shippingStatus;

    private LocalDate deliveryStartAt;
    private LocalDate deliveryEndAt;

    @Column(columnDefinition = "numeric(50,20)")
    private BigDecimal trackingLongitude;

    @Column(columnDefinition = "numeric(50,20)")
    private BigDecimal trackingLatitude;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "carrier_id")
    private Carrier carrier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @OneToOne
    @JoinColumn(name = "order_id")
    private TransportOrder order;

    @PrePersist
    void prePersist() {
        if (transportType == null) {
            transportType = TransportType.LIGHT;
        }
        if (shippingStatus == null) {
            shippingStatus = ShippingStatus.CREATED;
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
