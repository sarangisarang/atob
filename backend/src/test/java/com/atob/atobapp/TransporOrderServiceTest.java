package com.atob.atobapp;

import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import com.atob.atobapp.security.MyUserDetailsService;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.OrderStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TransporOrderServiceTest {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ShippmentRepository shippmentRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private TransportOrderRepository transportOrderRepository;
    @Autowired private OrderService orderService;
    @Autowired private MyUserDetailsService myUserDetailsService;

    @Test // 1.1
    public void given_order_not_pending_cannot_update() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.updateOrder(order, order.getId()));
        assertTrue(ex.getMessage().contains("Not allowed to update order"));
    }

    @Test // 1.2
    public void given_order_pending_can_update() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Pending);
        transportOrderRepository.save(order);
        TransportOrder update = new TransportOrder();
        update.setOrderNo(40);
        update.setOrderId("30");
        update.setShippingDate(LocalDate.now());
        update.setOrderDate(LocalDate.now());
        update.setDeliveredDate(LocalDate.now());
        orderService.updateOrder(update, "1234");
        TransportOrder stored = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals("30", stored.getOrderId());
        assertEquals(40, stored.getOrderNo());
    }

    @Test // 2.1
    public void given_order_not_pending_cannot_move_to_processing() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatusProcessing(order.getId()));
        assertTrue(ex.getMessage().contains("Pending"));
    }

    @Test // 2.2
    public void given_order_pending_can_move_to_processing() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Pending);
        transportOrderRepository.save(order);
        TransportOrder result = orderService.updateOrderStatusProcessing("1234");
        assertEquals(OrderStatus.Processing, result.getOrderStatus());
    }

    @Test // 3.1
    public void given_order_not_processing_cannot_move_to_waitingCarrier() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Delivered);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatusWaitingCarrier(order.getId()));
        assertTrue(ex.getMessage().contains("Processing"));
    }

    @Test // 3.2
    public void given_order_processing_can_move_to_waitingCarrier() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(order);
        orderService.updateOrderStatusWaitingCarrier("1234");
        TransportOrder stored = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(OrderStatus.WaitingCarrier, stored.getOrderStatus());
    }

    @Test // 4.1
    public void given_order_not_waitingCarrier_cannot_move_to_shipped() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Shipped);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatusShipped(order.getId()));
        assertTrue(ex.getMessage().contains("WaitingCarrier"));
    }

    @Test // 4.2
    public void given_order_waitingCarrier_can_move_to_shipped() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.WaitingCarrier);
        transportOrderRepository.save(order);
        orderService.updateOrderStatusShipped("1234");
        TransportOrder stored = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(OrderStatus.Shipped, stored.getOrderStatus());
    }

    @Test // 5.1
    public void given_order_not_shipped_cannot_move_to_delivered() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Pending);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatusDelivered(order.getId()));
        assertTrue(ex.getMessage().contains("Shipped"));
    }

    @Test // 5.2
    public void given_order_shipped_can_move_to_delivered() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Shipped);
        transportOrderRepository.save(order);
        orderService.updateOrderStatusDelivered("1234");
        TransportOrder stored = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(OrderStatus.Delivered, stored.getOrderStatus());
    }

    @Test
    public void cancel_pending_order_succeeds() {
        TransportOrder order = TestUtils.createTransportOrder();
        transportOrderRepository.save(order);
        TransportOrder cancelled = orderService.cancelOrder("1234");
        assertEquals(OrderStatus.Cancelled, cancelled.getOrderStatus());
    }

    @Test
    public void cancel_non_pending_order_throws() {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Shipped);
        transportOrderRepository.save(order);
        Exception ex = assertThrows(BadRequestException.class,
                () -> orderService.cancelOrder("1234"));
        assertTrue(ex.getMessage().contains("Pending"));
    }

    @Test
    public void load_admin_user_succeeds() {
        UserDetails userDetails = myUserDetailsService.loadUserByUsername("admin");
        assertNotNull(userDetails);
    }
}
