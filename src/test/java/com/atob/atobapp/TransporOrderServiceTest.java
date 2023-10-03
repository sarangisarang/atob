package com.atob.atobapp;

import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.*;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.StatusService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.xml.stream.Location;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
    @Test
    public void given_order_with_all_when_has_status_Diferent_processing_can_not_change(){
        TransportOrder orders = new TransportOrder();
        orders.setOrderNo(20);
        orders.setOrderId("10");
        orders.setShippingDate(LocalDate.now());
        orders.setOrderDate(LocalDate.now());
        orders.setDeliveredDate(LocalDate.now());
        orders.setStatusService(StatusService.Processing);
        orders.setId("1234");
        transportOrderRepository.save(orders);
        TransportOrder neworders =  transportOrderRepository.findById("1234").orElseThrow();
        Assertions.assertNotNull(neworders);
        Exception exception = assertThrows(Exception.class,()-> orderService.UpdateOrder(neworders.getId(),));
        assertEquals(exception.getMessage(),"Not allowed to update  order" );
    }

}
