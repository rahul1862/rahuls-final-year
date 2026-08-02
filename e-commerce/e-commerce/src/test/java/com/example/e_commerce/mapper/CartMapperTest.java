package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.dto.CartItemDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CartMapperTest {

    private final ProductMapper productMapper = new ProductMapper();
    private final UserMapper userMapper = new UserMapper();
    private final CartItemMapper cartItemMapper = new CartItemMapper(productMapper);
    private final CartMapper cartMapper = new CartMapper(userMapper, cartItemMapper);

    @Test
    void toEntity_copiesCartIdCreatedAtAndUser() {
        UserDto userDto = new UserDto();
        userDto.setUserId("u-1");
        userDto.setName("Alice");
        userDto.setEmail("alice@example.com");

        CartDto cartDto = new CartDto();
        cartDto.setCartId("cart-1");
        cartDto.setCreatedAt(new Date(1_700_000_000_000L));
        cartDto.setUserDto(userDto);
        cartDto.setCartItemsDto(new ArrayList<>());

        Cart entity = cartMapper.toEntity(cartDto);

        assertThat(entity.getCartId()).isEqualTo("cart-1");
        assertThat(entity.getCreatedAt()).isEqualTo(cartDto.getCreatedAt());
        assertThat(entity.getUsers().getName()).isEqualTo("Alice");
    }

    @Test
    void toEntity_neverActuallyConvertsCartItemsFromDto() {
        UserDto userDto = new UserDto();
        userDto.setUserId("u-1");
        userDto.setName("Alice");

        CartItemDto itemDto = CartItemDto.builder()
                .cartItemId("ci-1")
                .quantity(2)
                .totalPrice(40)
                .build();

        CartDto cartDto = new CartDto();
        cartDto.setCartId("cart-2");
        cartDto.setCreatedAt(new Date());
        cartDto.setUserDto(userDto);
        cartDto.setCartItemsDto(new ArrayList<>(List.of(itemDto)));

        Cart entity = cartMapper.toEntity(cartDto);

        assertThat(entity.getCartItems()).isEmpty();
    }

    @Test
    void toDto_copiesCartIdCreatedAtUserAndItems() {
        Users user = new Users();
        user.setUserId("u-2");
        user.setName("Bob");
        user.setEmail("bob@example.com");

        Product product = new Product();
        product.setProductId("p-1");
        product.setTitle("Widget");

        CartItems item = CartItems.builder()
                .cartItemId("ci-2")
                .quantity(3)
                .totalPrice(30)
                .product(product)
                .build();

        Cart cart = new Cart();
        cart.setCartId("cart-3");
        cart.setCreatedAt(new Date(1_700_000_000_000L));
        cart.setUsers(user);
        cart.setCartItems(new ArrayList<>(List.of(item)));

        CartDto dto = cartMapper.toDto(cart);

        assertThat(dto.getCartId()).isEqualTo("cart-3");
        assertThat(dto.getCreatedAt()).isEqualTo(cart.getCreatedAt());
        assertThat(dto.getUserDto().getName()).isEqualTo("Bob");
        assertThat(dto.getCartItemsDto()).hasSize(1);
        assertThat(dto.getCartItemsDto().get(0).getCartItemId()).isEqualTo("ci-2");
    }

    @Test
    void toUpdate_isUnimplementedStub_alwaysReturnsNull() {
        Cart cart = new Cart();
        CartDto dto = new CartDto();

        Cart result = cartMapper.toUpdate(cart, dto);

        assertThat(result).isNull();
    }

    @Test
    void toDtoList_mapsEachCart() {
        Users user = new Users();
        user.setUserId("u-3");
        user.setName("Carol");

        Cart first = new Cart();
        first.setCartId("cart-4");
        first.setUsers(user);

        Cart second = new Cart();
        second.setCartId("cart-5");
        second.setUsers(user);

        List<CartDto> dtos = cartMapper.toDtoList(List.of(first, second));

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getCartId()).isEqualTo("cart-4");
        assertThat(dtos.get(1).getCartId()).isEqualTo("cart-5");
    }
}
