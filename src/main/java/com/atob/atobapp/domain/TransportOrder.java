package com.atob.atobapp.domain;
import com.atob.atobapp.service.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Setter
@Getter
public class TransportOrder {
    @Id
    private String orderId;
    private Integer orderNo;
    private LocalDate orderDate;
    private LocalDate shippingDate;
    private String isDelivered;
    private Location shippingFrom;
    private  Location shippingTo;


    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;


    @ManyToOne
    @JoinColumn(name="Customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name="Product_id")
    private Product product;
}
