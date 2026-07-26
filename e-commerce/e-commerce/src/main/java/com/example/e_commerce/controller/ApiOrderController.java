package com.example.e_commerce.controller;

import com.example.e_commerce.entity.*;
import com.example.e_commerce.repository.*;
import com.example.e_commerce.security.TokenService;
import com.example.e_commerce.repository.CheckoutRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class ApiOrderController {

    private final UsersRepository usersRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final TokenService tokenService;
    private final CheckoutRepository checkoutRepository;

    public ApiOrderController(UsersRepository usersRepository, ProductRepository productRepository,
                             CartRepository cartRepository, OrderRepository orderRepository,
                             CategoryRepository categoryRepository,
                             TokenService tokenService, CheckoutRepository checkoutRepository) {
        this.usersRepository = usersRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
        this.tokenService = tokenService;
        this.checkoutRepository = checkoutRepository;
    }

    private Category getOrCreateDefaultCategory() {
        // Find existing category or create default one
        List<Category> all = categoryRepository.findAll();
        if (!all.isEmpty()) return all.get(0);
        Category cat = new Category();
        cat.setCategoryId(UUID.randomUUID().toString());
        cat.setTitle("General");
        cat.setDescription("Default category");
        return categoryRepository.save(cat);
    }

    /**
     * Sync cart to backend: creates/updates cart and cart_items tables
     */
    @PostMapping("/sync-cart")
    public ResponseEntity<?> syncCart(@RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestBody Map<String, Object> body) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated."));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

            Cart cart = cartRepository.findByUsers(user);
            if (cart == null) {
                cart = new Cart();
                cart.setCartId(UUID.randomUUID().toString());
                cart.setCreatedAt(new Date());
                cart.setUsers(user);
            }
            cart.getCartItems().clear();

            for (Map<String, Object> item : items) {
                // Try to find existing product by UUID
                String productId = String.valueOf(item.get("id"));
                Product product = null;
                try {
                    product = productRepository.findById(productId).orElse(null);
                } catch (Exception ignored) {}

                // If not found, create a lightweight product entry from item data
                if (product == null) {
                    product = new Product();
                    product.setProductId(UUID.randomUUID().toString());
                    product.setTitle((String) item.getOrDefault("name", "Item"));
                    product.setDescription((String) item.getOrDefault("description", ""));
                    product.setPrice(((Number) item.getOrDefault("price", 0.0)).doubleValue());
                    product.setDiscountedPrice(((Number) item.getOrDefault("price", 0.0)).intValue());
                    product.setQuantity(1);
                    product.setStock(true);
                    product.setLive(true);
                    product.setAddedDate(new Date());
                    product.setImageUrl((String) item.getOrDefault("image", ""));
                    product.setCountry((String) item.getOrDefault("country", ""));
                    product.setFlag((String) item.getOrDefault("flag", ""));
                    product.setRating(((Number) item.getOrDefault("rating", 0)).doubleValue());
                    product.setReviews(((Number) item.getOrDefault("reviews", 0)).intValue());
                    product.setCategory(getOrCreateDefaultCategory());
                    product = productRepository.save(product);
                }

                int quantity = ((Number) item.getOrDefault("quantity", 1)).intValue();
                CartItems cartItem = CartItems.builder()
                        .quantity(quantity)
                        .totalPrice(quantity * (product.getDiscountedPrice() > 0 ? product.getDiscountedPrice() : (int) product.getPrice()))
                        .cart(cart)
                        .product(product)
                        .build();
                cartItem.generateId();
                cart.getCartItems().add(cartItem);
            }

            Cart savedCart = cartRepository.save(cart);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("cartId", savedCart.getCartId());
            response.put("message", "Cart synced successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create order from synced cart: creates orders and order_items tables
     */
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestBody Map<String, Object> body) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated."));
            }

            String cartId = (String) body.get("cartId");
            Cart cart = null;
            if (cartId != null && !cartId.isEmpty()) {
                cart = cartRepository.findById(cartId).orElse(null);
            }
            if (cart == null) {
                cart = cartRepository.findByUsers(user);
            }
            if (cart == null || cart.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No items in cart. Sync cart first."));
            }

            // Create order
            Order order = new Order();
            order.setOrderId(UUID.randomUUID().toString());
            order.setOrderStatus("Processing");
            order.setPaymentStatus("PAID");
            order.setBillingAddress((String) body.get("billingAddress"));
            order.setBillingPhone((String) body.getOrDefault("billingPhone", ""));
            order.setBillingName((String) body.getOrDefault("billingName", ""));
            order.setOrderedDate(new Date());
            order.setUsers(user);

            // Create order items from cart items
            List<OrderItem> orderItems = new ArrayList<>();
            int totalAmount = 0;

            for (CartItems cartItem : cart.getCartItems()) {
                OrderItem orderItem = OrderItem.builder()
                        .quantity(cartItem.getQuantity())
                        .product(cartItem.getProduct())
                        .totalPrice(cartItem.getTotalPrice())
                        .order(order)
                        .build();
                totalAmount += orderItem.getTotalPrice();
                orderItems.add(orderItem);
            }

            order.setOrderItems(orderItems);
            order.setOrderAmount(totalAmount);

            // Clear cart
            cart.getCartItems().clear();
            cartRepository.save(cart);

            Order savedOrder = orderRepository.save(order);

            // Save to user JSON for frontend display
            Map<String, Object> orderMap = new LinkedHashMap<>();
            orderMap.put("id", savedOrder.getOrderId());
            orderMap.put("date", savedOrder.getOrderedDate() != null ? savedOrder.getOrderedDate().toInstant().toString() : Instant.now().toString());
            orderMap.put("status", savedOrder.getOrderStatus());
            orderMap.put("estimatedDelivery", Instant.now().plus(5, ChronoUnit.DAYS).toString());
            orderMap.put("total", (double) savedOrder.getOrderAmount());

            List<Object> existingOrders = readJsonArray(user.getOrdersJson());
            existingOrders.add(0, orderMap);
            user.setOrdersJson(writeJson(existingOrders));
            usersRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Order created successfully",
                    "orderId", savedOrder.getOrderId(),
                    "order", orderMap
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Fire-and-forget order creation - accepts items directly with all data
     */
    @PostMapping("/create-with-items")
    public ResponseEntity<?> createOrderWithItems(@RequestHeader(value = "Authorization", required = false) String auth,
                                                   @RequestBody Map<String, Object> body) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated."));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

            // Create order record
            Order order = new Order();
            order.setOrderId(UUID.randomUUID().toString());
            order.setOrderStatus("Processing");
            order.setPaymentStatus("PAID");
            order.setBillingAddress((String) body.get("billingAddress"));
            order.setBillingName((String) body.getOrDefault("billingName", ""));
            order.setOrderedDate(new Date());
            order.setUsers(user);
            double totalAmount = ((Number) body.getOrDefault("total", 0)).doubleValue();
            order.setOrderAmount((int) totalAmount);

            // Create order items from submitted data
            List<OrderItem> orderItems = new ArrayList<>();
            if (items != null) {
                for (Map<String, Object> item : items) {
                    Product product = null;
                    try {
                        String productId = String.valueOf(item.get("id"));
                        product = productRepository.findById(productId).orElse(null);
                    } catch (Exception ignored) {}

                    if (product == null) {
                        product = new Product();
                        product.setProductId(UUID.randomUUID().toString());
                        product.setTitle((String) item.getOrDefault("name", "Item"));
                        product.setDescription((String) item.getOrDefault("description", ""));
                        product.setPrice(((Number) item.getOrDefault("price", 0.0)).doubleValue());
                        product.setDiscountedPrice(((Number) item.getOrDefault("price", 0.0)).intValue());
                        product.setQuantity(1);
                        product.setStock(true);
                        product.setLive(true);
                        product.setAddedDate(new Date());
                        product.setImageUrl((String) item.getOrDefault("image", ""));
                        product.setCountry((String) item.getOrDefault("country", ""));
                        product.setCategory(getOrCreateDefaultCategory());
                        product = productRepository.save(product);
                    }

                    int quantity = ((Number) item.getOrDefault("quantity", 1)).intValue();
                    OrderItem orderItem = OrderItem.builder()
                            .quantity(quantity)
                            .product(product)
                            .totalPrice(quantity * (product.getDiscountedPrice() > 0 ? product.getDiscountedPrice() : (int) product.getPrice()))
                            .order(order)
                            .build();
                    orderItems.add(orderItem);
                }
            }

            order.setOrderItems(orderItems);
            order.setOrderAmount(orderItems.stream().mapToInt(OrderItem::getTotalPrice).sum());
            Order savedOrder = orderRepository.save(order);

            Map<String, Object> orderMap = new LinkedHashMap<>();
            orderMap.put("id", savedOrder.getOrderId());
            orderMap.put("date", savedOrder.getOrderedDate() != null ? savedOrder.getOrderedDate().toInstant().toString() : Instant.now().toString());
            orderMap.put("status", savedOrder.getOrderStatus());
            orderMap.put("estimatedDelivery", Instant.now().plus(5, ChronoUnit.DAYS).toString());
            orderMap.put("total", (double) savedOrder.getOrderAmount());
            orderMap.put("items", items != null ? items : List.of());

            List<Object> existingOrders = readJsonArray(user.getOrdersJson());
            existingOrders.add(0, orderMap);
            user.setOrdersJson(writeJson(existingOrders));
            usersRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Order created successfully", "orderId", savedOrder.getOrderId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private Users currentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String userId = tokenService.resolveUserId(authHeader.substring(7));
        if (userId == null) return null;
        return usersRepository.findById(userId).orElse(null);
    }

    private List<Object> readJsonArray(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();
        try {
            return new ArrayList<>(objectMapper.readValue(json,
                new tools.jackson.core.type.TypeReference<List<Object>>() {}));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String writeJson(Object value) {
        tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception e) {
            return "[]";
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> saveCheckout(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestBody Map<String, Object> body) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated."));
            }

            Checkout checkout = Checkout.builder()
                    .checkoutId(UUID.randomUUID().toString())
                    .firstName((String) body.getOrDefault("firstName", ""))
                    .lastName((String) body.getOrDefault("lastName", ""))
                    .email((String) body.getOrDefault("email", ""))
                    .address((String) body.getOrDefault("address", ""))
                    .city((String) body.getOrDefault("city", ""))
                    .postalCode((String) body.getOrDefault("zipCode", ""))
                    .cardNumber((String) body.getOrDefault("cardNumber", ""))
                    .expiryDateCard((String) body.getOrDefault("expiry", ""))
                    .cvc((String) body.getOrDefault("cvv", ""))
                    .createdAt(new Date())
                    .userId(user.getUserId())
                    .build();

            checkoutRepository.save(checkout);

            return ResponseEntity.ok(Map.of("message", "Checkout saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
