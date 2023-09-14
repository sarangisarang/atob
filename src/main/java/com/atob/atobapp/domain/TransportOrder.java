package com.atob.atobapp.domain;
import com.atob.atobapp.service.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Setter
@Getter
public class TransportOrder {
    @Id
    private String id;
    private String orderId;
    private Integer orderNo;
    private LocalDate orderDate;
    private LocalDate shippingDate;
    private String isDelivered;

    @ManyToOne
    @JoinColumn(name="shippingfrom_id")
    private Location shippingFrom;

    @ManyToOne
    @JoinColumn(name="shippingto_id")
    private Location shippingTo;


    @Enumerated(EnumType.STRING)
    private Status status;


    @ManyToOne
    @JoinColumn(name="Customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name="Product_id")
    private Product product;
}
