package com.atob.atobapp;

import com.atob.atobapp.domain.TransportOrder;

import java.time.LocalDate;

public class TestUtils {

    public static final String DEFAULT_ID = "1234";

    public static TransportOrder createTransportOrder() {
        TransportOrder orders = new TransportOrder();
        orders.setOrderNo(20);
        orders.setOrderId("10");
        orders.setShippingDate(LocalDate.now());
        orders.setOrderDate(LocalDate.now());
        orders.setDeliveredDate(LocalDate.now());
        orders.setId(DEFAULT_ID);
        return orders;
    }
}
