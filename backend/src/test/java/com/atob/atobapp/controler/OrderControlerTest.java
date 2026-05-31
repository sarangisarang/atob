package com.atob.atobapp.controler;

import com.atob.atobapp.TestUtils;
import com.atob.atobapp.domain.TransportOrder;
import com.atob.atobapp.repository.TransportOrderRepository;
import com.atob.atobapp.service.OrderService;
import com.atob.atobapp.service.OrderStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.nio.charset.StandardCharsets;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControlerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private TransportOrderRepository transportOrderRepository;
    @Autowired private OrderService orderService;

    @Test
    public void waitingCarrier_from_pending_returns_400() throws Exception {
        TransportOrder order = TestUtils.createTransportOrder();
        order.setOrderStatus(OrderStatus.Pending);
        transportOrderRepository.save(order);

        mockMvc.perform(MockMvcRequestBuilders
                        .put("/show/order/{id}/waitingCarrier", TestUtils.DEFAULT_ID)
                        .header(HttpHeaders.AUTHORIZATION,
                                "Basic " + HttpHeaders.encodeBasicAuth("admin", "1234", StandardCharsets.UTF_8)))
                .andExpect(MockMvcResultMatchers.status().is(400));
    }
}
