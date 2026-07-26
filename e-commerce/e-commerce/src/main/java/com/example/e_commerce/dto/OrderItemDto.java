package com.example.e_commerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderItemDto {

    @NotNull
    private String orderId;
    @Positive
    private int quantity;
    @Min(0)
    private int totalPrice;
    private ProductDto productDto;
    private OrderDto orderDto;

}
