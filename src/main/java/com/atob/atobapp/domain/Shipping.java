package com.atob.atobapp.domain;
import com.atob.atobapp.service.StatusService;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Shipping {

    @Id
    private String id;
    private LocalDate deliveryStartAt;
    private LocalDate deliveryEndAt;
    @Column(columnDefinition = "numeric(50,20)")
    private BigDecimal trackingLangitude;
    @Column(columnDefinition = "numeric(50,20)")
    private BigDecimal trackingLatitude;

    @OneToOne
    @JoinColumn(name="carrier_id")
    private Carrier carrier;

    @OneToOne
    @JoinColumn(name="order_id")
    private TransportOrder order;

    @Enumerated(EnumType.STRING)
    @JoinColumn(name="status_id")
    private StatusService statusService;
}
