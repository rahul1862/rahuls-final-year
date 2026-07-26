package com.example.e_commerce.controller;

import com.example.e_commerce.dto.Role;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import jakarta.servlet.ServletException;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CartControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    private Users persistUser() {
        Users user = new Users();
        user.setName("Alice");
        user.setEmail("cart-" + UUID.randomUUID() + "@example.com");
        user.setPassword("hashed");
        user.setRole(Role.USER);
        return usersRepository.save(user);
    }

    private Product persistProduct(int discountedPrice) {
        Product product = new Product();
        product.setProductId(UUID.randomUUID().toString());
        product.setTitle("Widget");
        product.setDiscountedPrice(discountedPrice);
        product.setPrice(discountedPrice);
        return productRepository.save(product);
    }

    private Map<String, Object> addItemPayload(String productId, int quantity) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("productId", productId);
        payload.put("quantity", quantity);
        return payload;
    }

    @Test
    void addItem_freshUserWithNoCartYet_throwsUnhandledNullPointerException() {
        Users user = persistUser();
        Product product = persistProduct(10);

        assertThatThrownBy(() -> mockMvc.perform(post("/carts/{userId}", user.getUserId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(addItemPayload(product.getProductId(), 2)))))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(NullPointerException.class);
    }

    @Test
    void addItem_productNotFound_returns404() throws Exception {
        Users user = persistUser();

        mockMvc.perform(post("/carts/{userId}", user.getUserId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(addItemPayload("does-not-exist", 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void addItem_userNotFound_returns404() throws Exception {
        Product product = persistProduct(10);

        mockMvc.perform(post("/carts/{userId}", "does-not-exist")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(addItemPayload(product.getProductId(), 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void addItem_existingCartNewProduct_throwsUnhandledExceptionDueToNullCartItemId() {
        Users user = persistUser();
        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);
        cart.setCartItems(new ArrayList<>());
        cartRepository.save(cart);

        Product product = persistProduct(15);

        assertThatThrownBy(() -> mockMvc.perform(post("/carts/{userId}", user.getUserId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(addItemPayload(product.getProductId(), 2)))))
                .isInstanceOf(ServletException.class)
                .hasMessageContaining("Identifier");
    }

    @Test
    void addItem_existingCartSameProductAlreadyPresent_incrementsQuantitySuccessfully() throws Exception {
        Users user = persistUser();
        Product product = persistProduct(20);

        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);

        CartItems existingItem = CartItems.builder()
                .cartItemId(UUID.randomUUID().toString())
                .quantity(1)
                .totalPrice(20)
                .product(product)
                .cart(cart)
                .build();

        cart.setCartItems(new ArrayList<>(java.util.List.of(existingItem)));
        cartRepository.save(cart);

        mockMvc.perform(post("/carts/{userId}", user.getUserId())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(addItemPayload(product.getProductId(), 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cartId").value(cart.getCartId()))
                .andExpect(jsonPath("$.data.cartItemsDto[0].quantity").value(4))
                .andExpect(jsonPath("$.data.cartItemsDto[0].totalPrice").value(80));
    }
}
