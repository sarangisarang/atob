package com.atob.atobapp.controler;

import com.atob.atobapp.TestUtils;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.TransportOrderRepository;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.StatusService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControlerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private TransportOrderRepository transportOrderRepository;
    @Autowired
    private OrderService orderService;

    @Test
    public void testBadRequest() throws Exception {
        TransportOrder transportOrder = TestUtils.createTransportOrder();
        transportOrder.setStatusService(StatusService.Pending);
        transportOrderRepository.save(transportOrder);

        mockMvc.perform(MockMvcRequestBuilders.put("/show/order/{id}/waitingCarrier", TestUtils.DEFAULT_ID))
                .andExpect(MockMvcResultMatchers.status().is(400))
                .andExpect(MockMvcResultMatchers.content().string("Invaled status"));
    }
}