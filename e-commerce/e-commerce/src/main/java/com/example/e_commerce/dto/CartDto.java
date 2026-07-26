package com.example.e_commerce.dto;

import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Users;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartDto {
    @NotNull
    private String cartId;
    @NotNull
    private Date createdAt;
    private UserDto userDto;
    private List<CartItemDto> cartItemsDto = new ArrayList<>();
}
