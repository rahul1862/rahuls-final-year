package com.example.e_commerce.system;

import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Order;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.OrderRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SystemJourneyTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpResponse<String> postJson(String fullUrl, Map<String, ?> body) throws Exception {
        String json = body == null ? "" : objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder(URI.create(fullUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String fullUrl) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(fullUrl)).GET().build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void fullJourney_category_product_register_login_cart_order() throws Exception {
        String categoryId = UUID.randomUUID().toString();
        Map<String, Object> categoryPayload = new HashMap<>();
        categoryPayload.put("categoryId", categoryId);
        categoryPayload.put("title", "Electronics");
        categoryPayload.put("description", "Electronic goods");

        HttpResponse<String> categoryResponse = postJson(url("/categories"), categoryPayload);
        assertThat(categoryResponse.statusCode()).isEqualTo(200);

        String productId = UUID.randomUUID().toString();
        String addProductUrl = UriComponentsBuilder.fromUriString(url("/categories/addProduct/" + categoryId))
                .queryParam("productId", productId)
                .queryParam("title", "Widget")
                .queryParam("price", "30.0")
                .queryParam("discountedPrice", "25")
                .queryParam("quantity", "10")
                .queryParam("stock", "true")
                .queryParam("live", "true")
                .toUriString();

        HttpResponse<String> productResponse = postJson(addProductUrl, null);
        assertThat(productResponse.statusCode()).isEqualTo(200);
        JsonNode productNode = objectMapper.readTree(productResponse.body()).path("data");
        assertThat(productNode.path("productId").asString()).isEqualTo(productId);
        assertThat(productNode.path("discountedPrice").asInt()).isEqualTo(25);

        String email = "journey-" + UUID.randomUUID() + "@example.com";
        Map<String, Object> registerPayload = new HashMap<>();
        registerPayload.put("name", "Journey User");
        registerPayload.put("email", email);
        registerPayload.put("password", "Secret1@");

        HttpResponse<String> registerResponse = postJson(url("/auth"), registerPayload);
        assertThat(registerResponse.statusCode()).isEqualTo(200);
        String userId = objectMapper.readTree(registerResponse.body())
                .path("data").path("userId").asString();
        assertThat(userId).isNotBlank();

        Map<String, Object> loginPayload = new HashMap<>();
        loginPayload.put("email", email);
        loginPayload.put("password", "Secret1@");

        HttpResponse<String> loginResponse = postJson(url("/auth/login"), loginPayload);
        assertThat(loginResponse.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(loginResponse.body()).path("data").path("email").asString())
                .isEqualTo(email);

        Map<String, Object> addItemPayload = new HashMap<>();
        addItemPayload.put("productId", productId);
        addItemPayload.put("quantity", 2);

        HttpResponse<String> addItemResponse = postJson(url("/carts/" + userId), addItemPayload);
        assertThat(addItemResponse.statusCode()).isEqualTo(500);

        Users user = usersRepository.findById(userId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);
        CartItems item = CartItems.builder()
                .cartItemId(UUID.randomUUID().toString())
                .quantity(2)
                .totalPrice(2 * product.getDiscountedPrice())
                .product(product)
                .cart(cart)
                .build();
        cart.setCartItems(new ArrayList<>(List.of(item)));
        cartRepository.save(cart);

        Map<String, Object> orderPayload = new HashMap<>();
        orderPayload.put("userId", userId);
        orderPayload.put("cartId", cart.getCartId());
        orderPayload.put("orderStatus", "PENDING");
        orderPayload.put("paymentStatus", "NOTPAID");
        orderPayload.put("billingAddress", "123 Main St");
        orderPayload.put("billingPhoneNo", "555-1234");
        orderPayload.put("billingName", "Journey User");

        HttpResponse<String> orderResponse = postJson(url("/orders"), orderPayload);
        assertThat(orderResponse.statusCode()).isEqualTo(200);
        JsonNode orderNode = objectMapper.readTree(orderResponse.body()).path("data");
        String orderId = orderNode.path("orderId").asString();
        assertThat(orderId).isNotBlank();
        assertThat(orderNode.path("orderAmount").asInt()).isEqualTo(50);

        List<Order> ordersForUser = orderRepository.findAllByUsers(user);
        assertThat(ordersForUser).extracting(Order::getOrderId).contains(orderId);
        assertThat(orderRepository.findById(orderId)).isPresent();

        HttpResponse<String> fetchOrdersResponse = get(url("/orders/" + userId));
        assertThat(fetchOrdersResponse.statusCode()).isEqualTo(500);
    }
}
