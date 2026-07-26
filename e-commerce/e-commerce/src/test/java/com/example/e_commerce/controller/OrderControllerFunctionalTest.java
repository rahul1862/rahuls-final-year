package com.example.e_commerce.controller;

import com.example.e_commerce.dto.Role;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerFunctionalTest {

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
        user.setEmail("order-" + UUID.randomUUID() + "@example.com");
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

    private Cart persistCartWithItems(Users user, Product... products) {
        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);
        List<CartItems> items = new ArrayList<>();
        for (Product p : products) {
            items.add(CartItems.builder()
                    .cartItemId(UUID.randomUUID().toString())
                    .quantity(2)
                    .totalPrice(2 * p.getDiscountedPrice())
                    .product(p)
                    .cart(cart)
                    .build());
        }
        cart.setCartItems(items);
        return cartRepository.save(cart);
    }

    private Map<String, Object> createOrderPayload(String userId, String cartId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("cartId", cartId);
        payload.put("orderStatus", "PENDING");
        payload.put("paymentStatus", "NOTPAID");
        payload.put("billingAddress", "123 Main St");
        payload.put("billingPhoneNo", "555-1234");
        payload.put("billingName", "Alice");
        return payload;
    }

    @Test
    void create_success_computesOrderAmountFromCartItems() throws Exception {
        Users user = persistUser();
        Product product = persistProduct(25);
        Cart cart = persistCartWithItems(user, product);

        mockMvc.perform(post("/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(createOrderPayload(user.getUserId(), cart.getCartId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderAmount").value(50));
    }

    @Test
    void create_userNotFound_returns404() throws Exception {
        mockMvc.perform(post("/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(createOrderPayload("does-not-exist", "also-missing"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_cartNotFound_returns404() throws Exception {
        Users user = persistUser();

        mockMvc.perform(post("/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(createOrderPayload(user.getUserId(), "does-not-exist"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void findOrderByUserId_pathVariableNameMismatch_returns500() throws Exception {
        Users user = persistUser();

        mockMvc.perform(get("/orders/{id}", user.getUserId()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getAll_returnsRawPageableResponse_withDefaultParams() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.message").doesNotExist());
    }

    @Test
    void delete_existingOrder_returns200() throws Exception {
        Users user = persistUser();
        Product product = persistProduct(10);
        Cart cart = persistCartWithItems(user, product);

        String body = mockMvc.perform(post("/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(createOrderPayload(user.getUserId(), cart.getCartId()))))
                .andReturn().getResponse().getContentAsString();

        String orderId = objectMapper.readTree(body).path("data").path("orderId").asText();

        mockMvc.perform(delete("/orders/{id}", orderId))
                .andExpect(status().isOk());
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/orders/{id}", "does-not-exist"))
                .andExpect(status().isNotFound());
    }
}
