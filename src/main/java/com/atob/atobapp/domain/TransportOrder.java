package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name="Customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name="Product_id")
    private Product product;
}
