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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CategoryControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> categoryPayload(String id) {
        Map<String, Object> payload = new HashMap<>();
        if (id != null) payload.put("categoryId", id);
        payload.put("title", "Electronics");
        payload.put("description", "Electronic goods");
        return payload;
    }

    @Test
    void create_withExplicitId_succeeds() throws Exception {
        String id = UUID.randomUUID().toString();

        mockMvc.perform(post("/categories")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(categoryPayload(id))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryId").value(id));
    }

    @Test
    void create_missingTitle_returns400() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("description", "No title here");

        mockMvc.perform(post("/categories")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_withoutCategoryId_throwsUnhandledIdentifierGenerationException() {
        assertThatThrownBy(() -> mockMvc.perform(post("/categories")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(categoryPayload(null)))))
                .isInstanceOf(ServletException.class)
                .hasMessageContaining("Identifier");
    }

    @Test
    void findById_found_returns200() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/categories")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(categoryPayload(id))));

        mockMvc.perform(get("/categories/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Electronics"));
    }

    @Test
    void findById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/categories/{id}", "does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_thenFindById_returns404() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/categories")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(categoryPayload(id))));

        mockMvc.perform(delete("/categories/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/categories/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void addProductByCategory_viaRequestParams_bindsSuccessfully() throws Exception {
        String categoryId = UUID.randomUUID().toString();
        mockMvc.perform(post("/categories")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(categoryPayload(categoryId))));

        String productId = UUID.randomUUID().toString();
        mockMvc.perform(post("/categories/addProduct/{categoryId}", categoryId)
                        .param("productId", productId)
                        .param("title", "Bound Via Params")
                        .param("price", "10.0")
                        .param("quantity", "1")
                        .param("stock", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Bound Via Params"))
                .andExpect(jsonPath("$.data.productId").value(productId));
    }

    @Test
    void addProductByCategory_viaJsonBody_doesNotBind_titleStaysNull() throws Exception {
        String categoryId = UUID.randomUUID().toString();
        mockMvc.perform(post("/categories")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(categoryPayload(categoryId))));

        String productId = UUID.randomUUID().toString();
        Map<String, Object> productJson = new HashMap<>();
        productJson.put("title", "Should Not Bind");
        productJson.put("price", 10.0);
        productJson.put("quantity", 1);
        productJson.put("stock", true);

        mockMvc.perform(post("/categories/addProduct/{categoryId}", categoryId)
                        .param("productId", productId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(productJson)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").doesNotExist());
    }
}
