package com.example.e_commerce.controller;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiAuthControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, String> registerPayload(String name, String email, String password) {
        Map<String, String> payload = new HashMap<>();
        if (name != null) payload.put("name", name);
        if (email != null) payload.put("email", email);
        if (password != null) payload.put("password", password);
        return payload;
    }

    @Test
    void register_success_returnsTokenAndUser() throws Exception {
        String email = "alice-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload("Alice", email, "anything"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.name").value("Alice"))
                .andExpect(jsonPath("$.user.id").exists());
    }

    @Test
    void register_missingPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload("Alice", "alice@example.com", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Name, email and password are required."));
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        String email = "dupe-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(registerPayload("Alice", email, "anything"))));

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload("Alice2", email, "anything2"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("An account with this email already exists."));
    }

    @Test
    void login_correctCredentials_returnsTokenAndUser() throws Exception {
        String email = "loginok-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(registerPayload("Bob", email, "Secret1!"))));

        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", email);
        loginPayload.put("password", "Secret1!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void login_unknownEmail_returns401_unlikeLegacyAuthController() throws Exception {
        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", "nobody-" + UUID.randomUUID() + "@example.com");
        loginPayload.put("password", "whatever");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password."));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        String email = "wrongpass-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(registerPayload("Carol", email, "Secret1!"))));

        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", email);
        loginPayload.put("password", "WrongPassword1!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password."));
    }
}
