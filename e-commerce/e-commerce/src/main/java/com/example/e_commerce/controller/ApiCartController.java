package com.example.e_commerce.controller;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.CategoryRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.security.TokenService;
import com.example.e_commerce.service.CartService;
import com.example.e_commerce.util.AddItemRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class ApiCartController {

    private final CartService cartService;
    private final CartRepository cartRepository;
    private final UsersRepository usersRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final TokenService tokenService;

    public ApiCartController(CartService cartService, CartRepository cartRepository, 
                            UsersRepository usersRepository, ProductRepository productRepository,
                            CategoryRepository categoryRepository, TokenService tokenService) {
        this.cartService = cartService;
        this.cartRepository = cartRepository;
        this.usersRepository = usersRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.tokenService = tokenService;
    }

    /**
     * GET /api/cart - Retrieve cart items for authenticated user
     */
    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized: No valid token"));
            }

            Cart cart = cartRepository.findByUsers(user);

            if (cart == null) {
                return ResponseEntity.ok(Map.of(
                        "items", List.of(),
                        "total", 0.0
                ));
            }

            double total = cart.getCartItems().stream()
                    .mapToDouble(item -> item.getTotalPrice() > 0 ? item.getTotalPrice() : 0)
                    .sum();

            return ResponseEntity.ok(Map.of(
                    "items", cart.getCartItems().stream()
                            .map(this::buildCartItemMap)
                            .collect(Collectors.toList()),
                    "total", total
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/cart - Update cart with new items (bulk update/replace)
     */
    @PutMapping
    public ResponseEntity<?> updateCart(@RequestHeader(value = "Authorization", required = false) String auth,
                                        @RequestBody Map<String, Object> payload) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized: No valid token"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

            if (items == null) {
                items = List.of();
            }

            Cart cart = cartRepository.findByUsers(user);
            if (cart == null) {
                cart = new Cart();
                cart.setCartId(UUID.randomUUID().toString());
                cart.setCreatedAt(new Date());
                cart.setUsers(user);
            }

            cart.getCartItems().clear();

            for (Map<String, Object> item : items) {
                String productId = String.valueOf(item.get("id"));
                int quantity = ((Number) item.getOrDefault("quantity", 1)).intValue();

                Product product = null;
                try {
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
                    product.setFlag((String) item.getOrDefault("flag", ""));
                    product.setRating(((Number) item.getOrDefault("rating", 0)).doubleValue());
                    product.setReviews(((Number) item.getOrDefault("reviews", 0)).intValue());
                    product.setCategory(getOrCreateDefaultCategory());
                    product = productRepository.save(product);
                }

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
            response.put("message", "Cart updated successfully");
            response.put("items", savedCart.getCartItems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new LinkedHashMap<>();
                        itemMap.put("id", item.getProduct().getProductId());
                        itemMap.put("name", item.getProduct().getTitle());
                        itemMap.put("price", item.getProduct().getDiscountedPrice());
                        itemMap.put("quantity", item.getQuantity());
                        return itemMap;
                    })
                    .collect(Collectors.toList()));
            response.put("total", savedCart.getCartItems().stream()
                    .mapToInt(CartItems::getTotalPrice).sum());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private Category getOrCreateDefaultCategory() {
        List<Category> all = categoryRepository.findAll();
        if (!all.isEmpty()) return all.get(0);
        Category cat = new Category();
        cat.setCategoryId(UUID.randomUUID().toString());
        cat.setTitle("General");
        cat.setDescription("Default category");
        return categoryRepository.save(cat);
    }

    /**
     * POST /api/cart - Add single item to cart
     */
    @PostMapping
    public ResponseEntity<?> addToCart(@RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestBody AddItemRequest addItemRequest) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized: No valid token"));
            }

            CartDto cartDto = cartService.addItemToCart(user.getUserId(), addItemRequest);
            return ResponseEntity.ok(Map.of(
                    "message", "Item added to cart successfully",
                    "cart", cartDto
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/cart - Clear entire cart
     */
    @DeleteMapping
    public ResponseEntity<?> clearCart(@RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            Users user = currentUser(auth);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized: No valid token"));
            }

            Cart cart = cartRepository.findByUsers(user);

            if (cart != null) {
                cart.getCartItems().clear();
                cartRepository.save(cart);
            }

            return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Helper method to build a cart item map with all product details
     */
    private Map<String, Object> buildCartItemMap(com.example.e_commerce.entity.CartItems item) {
        Map<String, Object> itemMap = new LinkedHashMap<>();
        itemMap.put("id", item.getProduct().getProductId());
        itemMap.put("name", item.getProduct().getTitle());
        itemMap.put("price", item.getProduct().getDiscountedPrice());
        itemMap.put("image", item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "");
        itemMap.put("quantity", item.getQuantity());
        itemMap.put("description", item.getProduct().getDescription() != null ? item.getProduct().getDescription() : "");
        itemMap.put("category", item.getProduct().getCategory() != null ? item.getProduct().getCategory().getTitle() : "");
        itemMap.put("rating", item.getProduct().getRating() != null ? item.getProduct().getRating() : 0);
        itemMap.put("reviews", item.getProduct().getReviews() != null ? item.getProduct().getReviews() : 0);
        itemMap.put("country", item.getProduct().getCountry() != null ? item.getProduct().getCountry() : "");
        itemMap.put("flag", item.getProduct().getFlag() != null ? item.getProduct().getFlag() : "");
        return itemMap;
    }

    /**
     * Helper method to extract userId from Authorization header via TokenService
     */
    private Users currentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String userId = tokenService.resolveUserId(authHeader.substring(7));
        if (userId == null) return null;
        return usersRepository.findById(userId).orElse(null);
    }
}
