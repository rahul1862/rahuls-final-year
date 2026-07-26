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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> userPayload(String email, String password) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", "Alice");
        payload.put("email", email);
        payload.put("password", password);
        return payload;
    }

    @Test
    void create_validPayload_returns200() throws Exception {
        String email = "users-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload(email, "Secret1@"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));
    }

    @Test
    void create_weakPassword_returns400_becauseValidIsEnforcedHere() throws Exception {
        String email = "weakpass-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload(email, "alllowercase1"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload("not-an-email", "Secret1@"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findById_found_returns200() throws Exception {
        String email = "findme-" + UUID.randomUUID() + "@example.com";
        String body = mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload(email, "Secret1@"))))
                .andReturn().getResponse().getContentAsString();
        String userId = objectMapper.readTree(body).path("data").path("userId").asText();

        mockMvc.perform(get("/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));
    }

    @Test
    void findById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/users/{id}", "does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_thenFindById_returns404() throws Exception {
        String email = "deleteme-" + UUID.randomUUID() + "@example.com";
        String body = mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload(email, "Secret1@"))))
                .andReturn().getResponse().getContentAsString();
        String userId = objectMapper.readTree(body).path("data").path("userId").asText();

        mockMvc.perform(delete("/users/{id}", userId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/users/{id}", userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_partialPayload_preservesOmittedFields() throws Exception {
        String email = "updateme-" + UUID.randomUUID() + "@example.com";
        String body = mockMvc.perform(post("/users")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(userPayload(email, "Secret1@"))))
                .andReturn().getResponse().getContentAsString();
        String userId = objectMapper.readTree(body).path("data").path("userId").asText();

        Map<String, Object> patch = new HashMap<>();
        patch.put("name", "Alice Updated");

        mockMvc.perform(put("/users/{id}", userId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Alice Updated"))
                .andExpect(jsonPath("$.data.email").value(email));
    }
}
