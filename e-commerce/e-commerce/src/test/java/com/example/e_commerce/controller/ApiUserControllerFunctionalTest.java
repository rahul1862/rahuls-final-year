package com.example.e_commerce.controller;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiUserControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken() throws Exception {
        String email = "apiuser-" + UUID.randomUUID() + "@example.com";
        Map<String, String> payload = new HashMap<>();
        payload.put("name", "Alice");
        payload.put("email", email);
        payload.put("password", "Secret1!");

        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(body).path("token").asText();
    }

    @Test
    void getProfile_missingAuthorizationHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated."));
    }

    @Test
    void getProfile_invalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/user/profile").header("Authorization", "Bearer garbage-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProfile_andUpdateProfile_roundTrip() throws Exception {
        String token = registerAndGetToken();

        mockMvc.perform(get("/api/user/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.name").value("Alice"));

        Map<String, String> update = new HashMap<>();
        update.put("phone", "555-9999");
        update.put("city", "Metropolis");

        mockMvc.perform(put("/api/user/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/user/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.phone").value("555-9999"))
                .andExpect(jsonPath("$.user.city").value("Metropolis"));
    }

    @Test
    void updatePassword_wrongCurrentPassword_returns400() throws Exception {
        String token = registerAndGetToken();

        Map<String, String> payload = new HashMap<>();
        payload.put("currentPassword", "WrongOne1!");
        payload.put("newPassword", "NewSecret1!");

        mockMvc.perform(put("/api/user/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Current password is incorrect."));
    }

    @Test
    void updatePassword_tooShortNewPassword_returns400() throws Exception {
        String token = registerAndGetToken();

        Map<String, String> payload = new HashMap<>();
        payload.put("currentPassword", "Secret1!");
        payload.put("newPassword", "abc");

        mockMvc.perform(put("/api/user/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("New password must be at least 6 characters."));
    }

    @Test
    void updatePassword_success_thenLoginWithNewPassword() throws Exception {
        String email = "changepw-" + UUID.randomUUID() + "@example.com";
        Map<String, String> registerPayload = new HashMap<>();
        registerPayload.put("name", "Bob");
        registerPayload.put("email", email);
        registerPayload.put("password", "Secret1!");

        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload)))
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(body).path("token").asText();

        Map<String, String> changePayload = new HashMap<>();
        changePayload.put("currentPassword", "Secret1!");
        changePayload.put("newPassword", "BrandNewPass1!");

        mockMvc.perform(put("/api/user/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(changePayload)))
                .andExpect(status().isOk());

        Map<String, String> loginOld = new HashMap<>();
        loginOld.put("email", email);
        loginOld.put("password", "Secret1!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginOld)))
                .andExpect(status().isUnauthorized());

        Map<String, String> loginNew = new HashMap<>();
        loginNew.put("email", email);
        loginNew.put("password", "BrandNewPass1!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginNew)))
                .andExpect(status().isOk());
    }

    @Test
    void cart_getAndPut_roundTripsOpaqueJson() throws Exception {
        String token = registerAndGetToken();

        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty());

        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(Map.of("productId", "p-1", "quantity", 2)));

        mockMvc.perform(put("/api/cart")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productId").value("p-1"))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void wishlist_getAndPut_roundTripsOpaqueJson() throws Exception {
        String token = registerAndGetToken();

        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(Map.of("productId", "p-9")));

        mockMvc.perform(put("/api/wishlist")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/wishlist").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productId").value("p-9"));
    }

    @Test
    void orders_postThenGetThenPatchStatus_roundTrips() throws Exception {
        String token = registerAndGetToken();

        Map<String, Object> orderBody = new HashMap<>();
        orderBody.put("items", List.of(Map.of("productId", "p-1", "quantity", 1)));
        orderBody.put("total", 42);

        String response = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(orderBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order.id").exists())
                .andExpect(jsonPath("$.order.status").value("Processing"))
                .andReturn().getResponse().getContentAsString();

        String orderId = objectMapper.readTree(response).path("order").path("id").asText();

        mockMvc.perform(get("/api/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders[0].id").value(orderId));

        Map<String, String> statusPayload = new HashMap<>();
        statusPayload.put("status", "Shipped");

        mockMvc.perform(patch("/api/orders/{orderId}/status", orderId)
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(statusPayload)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders[0].status").value("Shipped"));
    }
}
