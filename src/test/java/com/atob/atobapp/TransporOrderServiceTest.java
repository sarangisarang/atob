package com.atob.atobapp;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.StatusService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.reflect.Executable;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TransporOrderServiceTest {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ShippmentRepository shippmentRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private TransportOrderRepository transportOrderRepository;
    @Autowired
    private OrderService orderService;


    @Test   //  1.0
    public void given_transportorder_with_all_when_has_status_diferent_pending_can_not_update(){
        TransportOrder orders = createTransportOrder();
        orders.setStatusService(StatusService.Processing);
        transportOrderRepository.save(orders);
        TransportOrder neworders =  transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworders);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrder(neworders,neworders.getId()));
        assertEquals(exception.getMessage(),"Not allowed to update  order" );
    }

    @Test   //  1,2
    public void give_transportorder_with_all_when_has_status_same_pending_can_update(){
        TransportOrder orders = createTransportOrder();
        orders.setStatusService(StatusService.Pending);
        transportOrderRepository.save(orders);
        TransportOrder updateorders = new TransportOrder();
        updateorders.setOrderNo(40);
        updateorders.setOrderId("30");
        updateorders.setShippingDate(LocalDate.now());
        updateorders.setOrderDate(LocalDate.now());
        updateorders.setDeliveredDate(LocalDate.now());
        orderService.updateOrder(updateorders,"1234");
        TransportOrder storedOrder =  transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(updateorders.getOrderId(), storedOrder.getOrderId());
        assertEquals(updateorders.getOrderNo(), storedOrder.getOrderNo());
        assertEquals(updateorders.getShippingDate(), storedOrder.getShippingDate());
        assertEquals(updateorders.getOrderDate(), storedOrder.getOrderDate());
        assertEquals(updateorders.getDeliveredDate(), storedOrder.getDeliveredDate());
    }

    @Test   //  2.1
    public void give_transportorder_with_all_when_has_status_diferent_pending_can_not_change(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.Processing);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworders = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworders);
        Exception exception = assertThrows(BadRequestException.class,()->orderService.updateOrderStatusProcessing(neworders.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   //  2.2
    public void give_transporterorder_with_all_when_has_status_same_the_pending_can_change_for_Processing(){
    TransportOrder transportOrder =createTransportOrder();
    transportOrder.setStatusService(StatusService.Pending);
    transportOrderRepository.save(transportOrder);
    TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
    neworder.setStatusService(StatusService.WaitingCarrier);
    orderService.updateOrderStatusProcessing("1234");
    }

    @Test   //  3.1
    public void  give_transporterorder_with_all_when_has_status_diferent_processing_can_not_change(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.Delivered);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception  = assertThrows(BadRequestException.class, ()-> orderService.updateOrderStatusProcessing(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   //  3.2
    public  void give_transporterorder_with_all_when_has_status_same_processing_can_change_for_waitingCarrier(){
        TransportOrder transportOrder =createTransportOrder();
        transportOrder.setStatusService(StatusService.Processing);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworders = transportOrderRepository.findById("1234").orElseThrow();
        orderService.updateOrderStatusWaitingCarrier(neworders.getId());
        assertEquals(neworders.getStatusService(), StatusService.Processing);
    }

    @Test   //  4.1
    public void give_transporterorder_with_all_when_has_status_diferent_waitingcarrier_can_not_change(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.Shippet);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrderStatusShippet(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   // 4.2
    public void give_transporterorder_with_all_when_has_status_same_waitingcarrier_can_change_for_shippet(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.WaitingCarrier);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder =transportOrderRepository.findById("1234").orElseThrow();
        orderService.updateOrderStatusShippet("1234");
        assertEquals(neworder.getStatusService(),StatusService.WaitingCarrier);
    }

    @Test   // 5.1
    public void give_transporterorder_with_all_when_has_status_difernt_shippet_can_not_change(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.Pending);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrderStatusDelivered(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test
    public void give_transporterorder_with_all_when_has_status_same_shippet_can_change_for_delivered(){
        TransportOrder transportOrder = createTransportOrder();
        transportOrder.setStatusService(StatusService.Shippet);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        orderService.updateOrderStatusDelivered(neworder.getId());
        assertEquals(neworder.getStatusService(),StatusService.Shippet);

    }


    private static TransportOrder createTransportOrder() {
        TransportOrder orders = new TransportOrder();
        orders.setOrderNo(20);
        orders.setOrderId("10");
        orders.setShippingDate(LocalDate.now());
        orders.setOrderDate(LocalDate.now());
        orders.setDeliveredDate(LocalDate.now());
        orders.setId("1234");
        return orders;
    }
}
