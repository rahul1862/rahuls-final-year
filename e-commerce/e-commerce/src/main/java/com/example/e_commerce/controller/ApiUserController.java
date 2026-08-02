package com.example.e_commerce.controller;

import com.example.e_commerce.entity.Users;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.security.TokenService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiUserController {

    private static final TypeReference<List<Object>> LIST_TYPE = new TypeReference<>() {};

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;

    public ApiUserController(UsersRepository usersRepository, PasswordEncoder passwordEncoder,
                              TokenService tokenService, ObjectMapper objectMapper) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/user/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String auth) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("name", user.getName());
        profile.put("phone", user.getPhone());
        profile.put("address", user.getAddress());
        profile.put("city", user.getCity());
        profile.put("zip", user.getZip());
        profile.put("country", user.getCountry());
        return ResponseEntity.ok(Map.of("user", profile));
    }

    @PutMapping("/user/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestBody Map<String, String> body) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();

        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("address")) user.setAddress(body.get("address"));
        if (body.containsKey("city")) user.setCity(body.get("city"));
        if (body.containsKey("zip")) user.setZip(body.get("zip"));
        if (body.containsKey("country")) user.setCountry(body.get("country"));
        usersRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PutMapping("/user/password")
    public ResponseEntity<?> updatePassword(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestBody Map<String, String> body) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();

        String currentPassword = body.getOrDefault("currentPassword", "");
        String newPassword = body.getOrDefault("newPassword", "");
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect."));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters."));
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist(@RequestHeader(value = "Authorization", required = false) String auth) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();
        return ResponseEntity.ok(Map.of("items", readJsonArray(user.getWishlistJson())));
    }

    @PutMapping("/wishlist")
    public ResponseEntity<?> putWishlist(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestBody Map<String, Object> body) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();
        user.setWishlistJson(writeJson(body.get("items")));
        usersRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestHeader(value = "Authorization", required = false) String auth) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();
        return ResponseEntity.ok(Map.of("orders", readJsonArray(user.getOrdersJson())));
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestBody Map<String, Object> body) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();

        List<Object> orders = readJsonArray(user.getOrdersJson());

        Map<String, Object> order = new LinkedHashMap<>(body);
        order.put("id", "ORD-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase());
        order.put("date", Instant.now().toString());
        order.put("status", "Processing");
        order.put("estimatedDelivery", Instant.now().plus(5, ChronoUnit.DAYS).toString());

        orders.add(0, order);
        user.setOrdersJson(writeJson(orders));
        usersRepository.save(user);
        return ResponseEntity.ok(Map.of("order", order));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @PathVariable String orderId,
                                                @RequestBody Map<String, String> body) {
        Users user = currentUser(auth);
        if (user == null) return unauthorized();

        List<Object> orders = readJsonArray(user.getOrdersJson());
        for (Object o : orders) {
            if (o instanceof Map<?, ?> map && orderId.equals(map.get("id"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mutable = (Map<String, Object>) map;
                mutable.put("status", body.get("status"));
            }
        }
        user.setOrdersJson(writeJson(orders));
        usersRepository.save(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private Users currentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String userId = tokenService.resolveUserId(authHeader.substring(7));
        if (userId == null) return null;
        return usersRepository.findById(userId).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated."));
    }

    private List<Object> readJsonArray(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return new ArrayList<>(objectMapper.readValue(json, LIST_TYPE));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception e) {
            return "[]";
        }
    }
}
