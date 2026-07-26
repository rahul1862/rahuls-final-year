package com.example.e_commerce.smoke;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmokeTest {

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url(path))).GET().build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void root_servesStaticIndexPage() throws Exception {
        HttpResponse<String> response = get("/");

        assertThat(response.statusCode()).isEqualTo(200);
    }

    @Test
    void getProducts_returns200() throws Exception {
        HttpResponse<String> response = get("/product");

        assertThat(response.statusCode()).isEqualTo(200);
    }

    @Test
    void getCategories_returns404ForUnknownId() throws Exception {
        HttpResponse<String> response = get("/categories/does-not-exist");

        assertThat(response.statusCode()).isEqualTo(404);
    }

    @Test
    void getOrders_returns200() throws Exception {
        HttpResponse<String> response = get("/orders");

        assertThat(response.statusCode()).isEqualTo(200);
    }
}
