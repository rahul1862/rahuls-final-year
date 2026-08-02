package com.example.e_commerce.controller;

import jakarta.servlet.ServletException;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> registerPayload(String email, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", "Alice");
        payload.put("email", email);
        payload.put("password", password);
        return payload;
    }

    @Test
    void register_success_returns200WithEncodedPassword() throws Exception {
        String email = "alice-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload(email, "Secret1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.password").value(org.hamcrest.Matchers.not("Secret1!")));
    }

    @Test
    void register_noValidationEnforced_weakPasswordStillAccepted() throws Exception {
        String email = "weakpass-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerPayload(email, "weak"))))
                .andExpect(status().isOk());
    }

    @Test
    void register_duplicateEmail_returns404_notConflict() throws Exception {
        String email = "dupe-" + UUID.randomUUID() + "@example.com";
        Map<String, Object> payload = registerPayload(email, "Secret1!");

        mockMvc.perform(post("/auth")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(payload)));

        mockMvc.perform(post("/auth")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User is already registered"));
    }

    @Test
    void login_correctCredentials_returns200() throws Exception {
        String email = "loginok-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/auth")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(registerPayload(email, "Secret1!"))));

        Map<String, Object> loginPayload = new HashMap<>();
        loginPayload.put("email", email);
        loginPayload.put("password", "Secret1!");

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));
    }

    @Test
    void login_unknownEmail_throwsUnhandledRuntimeException() {
        Map<String, Object> loginPayload = new HashMap<>();
        loginPayload.put("email", "nobody-" + UUID.randomUUID() + "@example.com");
        loginPayload.put("password", "Whatever1!");

        assertThatThrownBy(() -> mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload))))
                .isInstanceOf(ServletException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void login_wrongPassword_throwsUnhandledRuntimeException() throws Exception {
        String email = "wrongpass-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/auth")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(registerPayload(email, "Secret1!"))));

        Map<String, Object> loginPayload = new HashMap<>();
        loginPayload.put("email", email);
        loginPayload.put("password", "TotallyWrong1!");

        assertThatThrownBy(() -> mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginPayload))))
                .isInstanceOf(ServletException.class)
                .hasMessageContaining("Invalid password");
    }
}
