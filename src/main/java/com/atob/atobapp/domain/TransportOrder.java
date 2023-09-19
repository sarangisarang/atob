package com.atob.atobapp.domain;
import com.atob.atobapp.service.StatusService;
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
    private LocalDate deliveredDate;

    @ManyToOne
    @JoinColumn(name="shippingfrom_id")
    private Location shippingFrom;

    @ManyToOne
    @JoinColumn(name="shippingto_id")
    private Location shippingTo;


    @Enumerated(EnumType.STRING)
    private StatusService statusService;


    @ManyToOne
    @JoinColumn(name="Customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name="Product_id")
    private Product product;
}
