package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.dto.CartItemDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class CartItemMapper implements Mapper<CartItems, CartItemDto> {

    private final ProductMapper productMapper;

    public CartItems toEntity(CartItemDto cartItemDto){
        CartItems cartItem = new CartItems();
        cartItem.setCartItemId(cartItemDto.getCartItemId());
        cartItem.setQuantity(cartItemDto.getQuantity());
        cartItem.setTotalPrice(cartItemDto.getTotalPrice());
        cartItem.setProduct(productMapper.toEntity(cartItemDto.getProductDto()));
        return cartItem;
    }

    public CartItemDto toDto(CartItems cartItem){
        CartItemDto cartItemDto = new CartItemDto();
        cartItemDto.setCartItemId(cartItem.getCartItemId());
        cartItemDto.setQuantity(cartItem.getQuantity());
        cartItemDto.setTotalPrice(cartItem.getTotalPrice());
        cartItemDto.setProductDto(productMapper.toDto(cartItem.getProduct()));
        cartItemDto.setCartDto(cartItemDto.getCartDto());
        return cartItemDto;
    }


    public List<CartItemDto> toDtoList(List<CartItems> entities) {
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
