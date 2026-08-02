package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.entity.Order;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OrderMapperTest {

    private final OrderMapper orderMapper = new OrderMapper();

    @Test
    void toEntity_copiesMappedFields() {
        Date deliveryDate = new Date(1_700_000_000_000L);
        OrderDto dto = new OrderDto("o-1", "PENDING", "NOTPAID", 250, "123 Main St", "555-1234", null, deliveryDate);

        Order entity = orderMapper.toEntity(dto);

        assertThat(entity.getOrderId()).isEqualTo("o-1");
        assertThat(entity.getOrderStatus()).isEqualTo("PENDING");
        assertThat(entity.getPaymentStatus()).isEqualTo("NOTPAID");
        assertThat(entity.getOrderAmount()).isEqualTo(250);
        assertThat(entity.getBillingAddress()).isEqualTo("123 Main St");
        assertThat(entity.getBillingPhone()).isEqualTo("555-1234");
        assertThat(entity.getDeliveredDate()).isEqualTo(deliveryDate);
    }

    @Test
    void toDto_copiesMappedFields() {
        Order entity = Order.builder()
                .orderId("o-2")
                .orderStatus("DELIVERED")
                .paymentStatus("PAID")
                .orderAmount(500)
                .billingAddress("456 Side St")
                .billingPhone("555-5678")
                .deliveredDate(new Date(1_700_000_000_000L))
                .build();

        OrderDto dto = orderMapper.toDto(entity);

        assertThat(dto.getOrderId()).isEqualTo("o-2");
        assertThat(dto.getOrderStatus()).isEqualTo("DELIVERED");
        assertThat(dto.getPaymentStatus()).isEqualTo("PAID");
        assertThat(dto.getOrderAmount()).isEqualTo(500);
        assertThat(dto.getBillingAddress()).isEqualTo("456 Side St");
        assertThat(dto.getBillingPhone()).isEqualTo("555-5678");
        assertThat(dto.getDeliveryDate()).isEqualTo(entity.getDeliveredDate());
    }

    @Test
    void toUpdate_withPartialDto_preservesOmittedFields() {
        Order existing = Order.builder()
                .orderId("o-3")
                .orderStatus("PENDING")
                .paymentStatus("NOTPAID")
                .orderAmount(100)
                .billingAddress("Original Address")
                .billingPhone("111-1111")
                .build();

        OrderDto patch = new OrderDto();
        patch.setOrderStatus("SHIPPED");

        Order updated = orderMapper.toUpdate(existing, patch);

        assertThat(updated.getOrderStatus()).isEqualTo("SHIPPED");
        assertThat(updated.getOrderAmount()).isEqualTo(100);
        assertThat(updated.getBillingAddress()).isEqualTo("Original Address");
        assertThat(updated.getBillingPhone()).isEqualTo("111-1111");
    }

    @Test
    void toDtoList_mapsEachOrder() {
        Order first = Order.builder().orderId("o-4").orderStatus("PENDING").build();
        Order second = Order.builder().orderId("o-5").orderStatus("DELIVERED").build();

        List<OrderDto> dtos = orderMapper.toDtoList(List.of(first, second));

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getOrderId()).isEqualTo("o-4");
        assertThat(dtos.get(1).getOrderId()).isEqualTo("o-5");
    }
}
