package com.example.e_commerce.controller;

import jakarta.servlet.ServletException;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> productPayload(String id) {
        Map<String, Object> payload = new HashMap<>();
        if (id != null) payload.put("productId", id);
        payload.put("title", "Widget");
        payload.put("description", "A test widget");
        payload.put("price", 25.0);
        payload.put("discountedPrice", 20);
        payload.put("quantity", 5);
        payload.put("stock", true);
        payload.put("live", true);
        return payload;
    }

    @Test
    void create_withExplicitId_succeeds() throws Exception {
        String id = UUID.randomUUID().toString();

        mockMvc.perform(post("/product")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(productPayload(id))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.productId").value(id))
                .andExpect(jsonPath("$.data.title").value("Widget"));
    }

    @Test
    void create_emptyBody_returns400_dueToJacksonPrimitiveConstructorQuirk() throws Exception {
        mockMvc.perform(post("/product")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_validationViolation_returns400_viaBeanValidation() throws Exception {
        Map<String, Object> payload = productPayload(UUID.randomUUID().toString());
        payload.put("price", 0.0);

        mockMvc.perform(post("/product")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_withoutProductId_throwsUnhandledIdentifierGenerationException() {
        assertThatThrownBy(() -> mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(null)))))
                .isInstanceOf(ServletException.class)
                .hasMessageContaining("Identifier");
    }

    @Test
    void findById_found_returns200() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(id))));

        mockMvc.perform(get("/product/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productId").value(id));
    }

    @Test
    void findById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/product/{id}", "does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product Not Found."));
    }

    @Test
    void delete_thenFindById_returns404() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(id))));

        mockMvc.perform(delete("/product/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/product/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAll_returnsRawPageableResponse_notWrappedInApiResponseMessage() throws Exception {
        mockMvc.perform(get("/product").param("pageSize", "5").param("pageNo", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.pageSize").value(5))
                .andExpect(jsonPath("$.message").doesNotExist());
    }

    @Test
    void update_partialPayload_omittingOnlyObjectFields_preservesThoseFields() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(id))));

        Map<String, Object> patch = new HashMap<>();
        patch.put("title", "Updated Widget");
        patch.put("price", 25.0);
        patch.put("discountedPrice", 20);
        patch.put("quantity", 5);

        mockMvc.perform(put("/product/{id}", id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated Widget"))
                .andExpect(jsonPath("$.data.description").value("A test widget"))
                .andExpect(jsonPath("$.data.stock").value(true));
    }

    @Test
    void update_partialPayload_omittingAPrimitiveField_returns400() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(id))));

        Map<String, Object> patch = new HashMap<>();
        patch.put("title", "Updated Widget");

        mockMvc.perform(put("/product/{id}", id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadImage_thenGetImage_roundTripsBytes() throws Exception {
        String id = UUID.randomUUID().toString();
        mockMvc.perform(post("/product")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(productPayload(id))));

        byte[] imageBytes = {1, 2, 3, 4};
        MockMultipartFile file = new MockMultipartFile("productImage", "test.png", "image/png", imageBytes);

        mockMvc.perform(multipart("/product/image/{id}", id).file(file))
                .andExpect(status().isOk());

        mockMvc.perform(get("/product/image/{id}", id))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(content().bytes(imageBytes));
    }
}
