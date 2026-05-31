package com.atob.atobapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cargo")
@Getter
@Setter
public class Cargo {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_id", nullable = false)
    private Shipping shipping;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo_type", nullable = false, length = 40)
    private CargoType cargoType = CargoType.GENERAL_GOODS;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "length_cm")
    private Double lengthCm;

    @Column(name = "width_cm")
    private Double widthCm;

    @Column(name = "height_cm")
    private Double heightCm;

    // Only populated when cargoType == VEHICLE
    @Column(length = 80)
    private String vin;

    @Column(name = "plate_number", length = 50)
    private String plateNumber;

    private Integer quantity = 1;

    @PrePersist
    void prePersist() {
        if (cargoType == null) {
            cargoType = CargoType.GENERAL_GOODS;
        }
        if (quantity == null) {
            quantity = 1;
        }
    }
}
