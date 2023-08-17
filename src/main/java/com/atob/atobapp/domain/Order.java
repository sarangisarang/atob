package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDate;
@Entity
public class Order {
    @Id
    private String id;
    private Integer orderNo;
    private LocalDate orderDate;
    private LocalDate shippingDate;
    private String isDelivered;


    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Integer getOrderNo() {
        return orderNo;
    }
    public void setOrderNo(Integer orderNo) {
        this.orderNo = orderNo;
    }
    public LocalDate getOrderDate() {
        return orderDate;
    }
    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDate getShippingDate() {
        return shippingDate;
    }

    public void setShippingDate(LocalDate shippingDate) {
        this.shippingDate = shippingDate;
    }

    public String getIsDelivered() {
        return isDelivered;
    }

    public void setIsDelivered(String isDelivered) {
        this.isDelivered = isDelivered;
    }
}
