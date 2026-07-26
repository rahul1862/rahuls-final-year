package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.entity.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper implements Mapper<Order,OrderDto> {
   public Order toEntity(OrderDto orderDto){
        Order order = new Order();

        order.setOrderId(orderDto.getOrderId());
        order.setOrderAmount(orderDto.getOrderAmount());
        order.setOrderStatus(orderDto.getOrderStatus());
        order.setBillingAddress(orderDto.getBillingAddress());
        order.setOrderAmount(orderDto.getOrderAmount());
        order.setBillingPhone(orderDto.getBillingPhone());
        order.setPaymentStatus(orderDto.getPaymentStatus());
        order.setDeliveredDate(orderDto.getDeliveryDate());

        return order;
    }


    public OrderDto toDto(Order order){
        OrderDto orderDto = new OrderDto();

        orderDto.setOrderId(order.getOrderId());
        orderDto.setOrderAmount(order.getOrderAmount());
        orderDto.setOrderStatus(order.getOrderStatus());
        orderDto.setBillingAddress(order.getBillingAddress());
        orderDto.setOrderAmount(order.getOrderAmount());
        orderDto.setBillingPhone(order.getBillingPhone());
        orderDto.setPaymentStatus(order.getPaymentStatus());
        orderDto.setDeliveryDate(order.getDeliveredDate());
        return orderDto;
    }

    public Order toUpdate(Order order, OrderDto orderDto) {

        if (orderDto.getOrderAmount() != 0) {
            order.setOrderAmount(orderDto.getOrderAmount());
        }

        if (orderDto.getOrderStatus() != null) {
            order.setOrderStatus(orderDto.getOrderStatus());
        }

        if (orderDto.getBillingAddress() != null) {
            order.setBillingAddress(orderDto.getBillingAddress());
        }

        if (orderDto.getBillingPhone() != null) {
            order.setBillingPhone(orderDto.getBillingPhone());
        }

        if (orderDto.getPaymentStatus() != null) {
            order.setPaymentStatus(orderDto.getPaymentStatus());
        }

        if (orderDto.getDeliveryDate() != null) {
            order.setDeliveredDate(orderDto.getDeliveryDate());
        }
        return order;
    }

    public List<OrderDto> toDtoList(List<Order> orders){
       return orders.stream().map(this::toDto).collect(Collectors.toList());
    }
}
