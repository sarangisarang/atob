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
    @Autowired
    private MyUserDetailsService myUserDetailsService;


    @Test   //  1.1
    public void given_transportorder_with_all_when_has_status_diferent_pending_can_not_update(){
        TransportOrder orders = TestUtils.createTransportOrder();
        orders.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(orders);
        TransportOrder neworders =  transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworders);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrder(neworders,neworders.getId()));
        assertEquals(exception.getMessage(),"Not allowed to update  order" );
    }

    @Test   //  1.2
    public void give_transportorder_with_all_when_has_status_same_pending_can_update(){
        TransportOrder orders = TestUtils.createTransportOrder();
        orders.setOrderStatus(OrderStatus.Pending);
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
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworders = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworders);
        Exception exception = assertThrows(BadRequestException.class,()->orderService.updateOrderStatusProcessing(neworders.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   //  2.2 need make all this stily
    public void give_transporterorder_with_all_when_has_status_same_the_pending_can_change_for_Processing(){
    TransportOrder transportOrder = TestUtils.createTransportOrder();
    transportOrder.setOrderStatus(OrderStatus.Pending);
    transportOrderRepository.save(transportOrder);
    TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
    TransportOrder neworderinfo=orderService.updateOrderStatusProcessing(neworder.getId());
    TransportOrder testdatabase = transportOrderRepository.findById("1234").orElseThrow();
    assertEquals(neworderinfo.getOrderStatus(), OrderStatus.Processing);
    assertEquals(testdatabase.getOrderStatus(), OrderStatus.Processing);
    }

    @Test   //  3.1
    public void  give_transporterorder_with_all_when_has_status_diferent_processing_can_not_change(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Delivered);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception  = assertThrows(BadRequestException.class, ()-> orderService.updateOrderStatusProcessing(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   //  3.2
    public  void give_transporterorder_with_all_when_has_status_same_processing_can_change_for_waitingCarrier(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Processing);
        transportOrderRepository.save(transportOrder);
        orderService.updateOrderStatusWaitingCarrier("1234");
        TransportOrder testdatabase = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(testdatabase.getOrderStatus(), OrderStatus.WaitingCarrier);
    }

    @Test   //  4.1
    public void give_transporterorder_with_all_when_has_status_diferent_waitingcarrier_can_not_change(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Shippet);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrderStatusShippet(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   // 4.2
    public void give_transporterorder_with_all_when_has_status_same_waitingcarrier_can_change_for_shippet(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.WaitingCarrier);
        transportOrderRepository.save(transportOrder);
        orderService.updateOrderStatusShippet("1234");
        TransportOrder neworder =transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertEquals(OrderStatus.Shippet, neworder.getOrderStatus());
    }

    @Test   // 5.1
    public void give_transporterorder_with_all_when_has_status_difernt_shippet_can_not_change(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Pending);
        transportOrderRepository.save(transportOrder);
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworder);
        Exception exception = assertThrows(BadRequestException.class,()-> orderService.updateOrderStatusDelivered(neworder.getId()));
        assertEquals(exception.getMessage(),"Invaled status");
    }

    @Test   // 5.2
    public void give_transporterorder_with_all_when_has_status_same_shippet_can_change_for_delivered(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Shippet);
        transportOrderRepository.save(transportOrder);
        orderService.updateOrderStatusDelivered("1234");
        TransportOrder neworder = transportOrderRepository.findById("1234").orElseThrow();
        assertEquals(neworder.getOrderStatus(), OrderStatus.Delivered);
    }
    @Test
    public void cancel_given_order_with_status_pending(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder = transportOrderRepository.save(transportOrder);
        Assertions.assertEquals(transportOrder.getOrderStatus(), OrderStatus.Pending);
        transportOrder = orderService.cancelOrder(transportOrder);
        Assertions.assertEquals(transportOrder.getOrderStatus(), OrderStatus.Cenceled);
    }
    @Test
    public void cancel_give_order_with_status_difenet_pending(){
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setOrderStatus(OrderStatus.Shippet);
        final TransportOrder canceledorder = transportOrderRepository.save(transportOrder);
        Assertions.assertNotNull(transportOrder);
        Exception exception = Assertions.assertThrows(BadRequestException.class,()-> orderService.cancelOrder(canceledorder));
        assertEquals(exception.getMessage(), "Can not cencel this order");


    }
    @Test
    public void Find_all_users(){
        UserDetails userDetails = myUserDetailsService.loadUserByUsername("admin");
        assertNotNull(userDetails);
    }
}
