package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.CartItemMapper;
import com.example.e_commerce.mapper.CartMapper;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.mapper.UserMapper;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.util.AddItemRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private UsersRepository usersRepository;
    @Mock
    private CartRepository cartRepository;

    private final ProductMapper productMapper = new ProductMapper();
    private final UserMapper userMapper = new UserMapper();
    private final CartItemMapper cartItemMapper = new CartItemMapper(productMapper);
    private final CartMapper cartMapper = new CartMapper(userMapper, cartItemMapper);

    private CartServiceImpl cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartServiceImpl(productRepository, usersRepository, cartRepository, cartMapper);
    }

    private Product product(String id, int discountedPrice) {
        Product p = new Product();
        p.setProductId(id);
        p.setTitle("Widget");
        p.setDiscountedPrice(discountedPrice);
        return p;
    }

    private Users user(String id) {
        Users u = new Users();
        u.setUserId(id);
        u.setName("Alice");
        u.setEmail("alice@example.com");
        return u;
    }

    @Test
    void addItemToCart_productNotFound_throws() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        AddItemRequest request = new AddItemRequest("missing", 1);

        assertThatThrownBy(() -> cartService.addItemToCart("u-1", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addItemToCart_userNotFound_throws() {
        when(productRepository.findById("p-1")).thenReturn(Optional.of(product("p-1", 10)));
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        AddItemRequest request = new AddItemRequest("p-1", 1);

        assertThatThrownBy(() -> cartService.addItemToCart("missing", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addItemToCart_freshUserWithNoExistingCart_throwsNullPointerException() {
        when(productRepository.findById("p-1")).thenReturn(Optional.of(product("p-1", 10)));
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(user("u-1")));
        when(cartRepository.findByUsers(any(Users.class))).thenReturn(null);

        AddItemRequest request = new AddItemRequest("p-1", 2);

        assertThatThrownBy(() -> cartService.addItemToCart("u-1", request))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void addItemToCart_existingCartNewProduct_addsNewCartItem() {
        Users foundUser = user("u-1");
        Cart existingCart = new Cart();
        existingCart.setCartId("cart-1");
        existingCart.setCreatedAt(new Date());
        existingCart.setUsers(foundUser);
        existingCart.setCartItems(new ArrayList<>());

        Product product = product("p-1", 25);

        when(productRepository.findById("p-1")).thenReturn(Optional.of(product));
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(foundUser));
        when(cartRepository.findByUsers(foundUser)).thenReturn(existingCart);
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        AddItemRequest request = new AddItemRequest("p-1", 3);

        CartDto result = cartService.addItemToCart("u-1", request);

        assertThat(existingCart.getCartItems()).hasSize(1);
        CartItems added = existingCart.getCartItems().get(0);
        assertThat(added.getQuantity()).isEqualTo(3);
        assertThat(added.getTotalPrice()).isEqualTo(75);
        assertThat(added.getCartItemId()).isNull();
        assertThat(result.getCartId()).isEqualTo("cart-1");
    }

    @Test
    void addItemToCart_existingCartSameProductAlreadyPresent_incrementsQuantity() {
        Users foundUser = user("u-1");
        Product product = product("p-1", 10);

        CartItems existingItem = CartItems.builder()
                .cartItemId("ci-1")
                .quantity(2)
                .totalPrice(20)
                .product(product)
                .build();

        Cart existingCart = new Cart();
        existingCart.setCartId("cart-1");
        existingCart.setUsers(foundUser);
        existingCart.setCartItems(new ArrayList<>(List.of(existingItem)));

        when(productRepository.findById("p-1")).thenReturn(Optional.of(product));
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(foundUser));
        when(cartRepository.findByUsers(foundUser)).thenReturn(existingCart);
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        AddItemRequest request = new AddItemRequest("p-1", 5);

        cartService.addItemToCart("u-1", request);

        assertThat(existingCart.getCartItems()).hasSize(1);
        CartItems updated = existingCart.getCartItems().get(0);
        assertThat(updated.getQuantity()).isEqualTo(7);
        assertThat(updated.getTotalPrice()).isEqualTo(70);
        assertThat(updated.getCartItemId()).isEqualTo("ci-1");
    }
}
