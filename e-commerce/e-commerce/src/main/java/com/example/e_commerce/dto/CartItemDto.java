package com.example.e_commerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {
    @NotNull
    private String cartItemId;
    @NotNull @Min(0)
    private int quantity;
    @NotNull @Min(0)
    private int totalPrice;
    private ProductDto productDto;
    private CartDto cartDto;
}
