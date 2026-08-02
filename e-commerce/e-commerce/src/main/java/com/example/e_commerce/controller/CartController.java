package com.example.e_commerce.controller;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.service.CartService;
import com.example.e_commerce.util.AddItemRequest;
import com.example.e_commerce.util.ApiResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponseMessage> addItems(@PathVariable String userId, @RequestBody AddItemRequest addItemRequest){

        CartDto cartDto = cartService.addItemToCart(userId, addItemRequest);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Cart Added")
                .status(HttpStatus.OK)
                .success(true)
                .data(cartDto).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }
}
