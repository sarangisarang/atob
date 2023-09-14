package com.atob.atobapp.domain;
import com.atob.atobapp.service.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Shippment {

    @Id
    private String id;

    @OneToOne
    @JoinColumn(name="carrier_id")
    private Carrier carrier;

    @OneToOne
    @JoinColumn(name="order_id")
    private TransportOrder order;

    @Enumerated(EnumType.STRING)
    @JoinColumn(name="status_id")
    private Status status;
}
