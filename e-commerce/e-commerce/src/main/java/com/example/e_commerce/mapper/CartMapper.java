package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.entity.Cart;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper implements Mapper<Cart, CartDto> {
    private final UserMapper userMapper;
    private final CartItemMapper cartItemMapper;
    public CartMapper(UserMapper userMapper, CartItemMapper cartItemMapper) {
        this.userMapper = userMapper;
        this.cartItemMapper = cartItemMapper;
    }

    public Cart toEntity(CartDto cartDto){
        Cart cart = new Cart();
        cart.setCartId(cartDto.getCartId());
        cart.setCreatedAt(cartDto.getCreatedAt());
        cart.setUsers(userMapper.toEntity(cartDto.getUserDto()));
        cart.setCartItems(cart.getCartItems().stream().collect(Collectors.toList()));
        return cart;
    }

    public Cart toUpdate(Cart entity, CartDto dto) {
        return null;
    }

    public List<CartDto> toDtoList(List<Cart> entity) {
        return entity.stream().map(this::toDto).collect(Collectors.toList());
    }


    public CartDto toDto(Cart cart){
        CartDto cartDto = new CartDto();
        cartDto.setCartId(cart.getCartId());
        cartDto.setCreatedAt(cart.getCreatedAt());
        cartDto.setUserDto(userMapper.toDto(cart.getUsers()));
        cartDto.setCartItemsDto(cartItemMapper.toDtoList(cart.getCartItems().stream().collect(Collectors.toList())));
        return cartDto;
    }

}
