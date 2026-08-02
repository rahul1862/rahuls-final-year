package com.example.e_commerce.service;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.util.AddItemRequest;

public interface CartService {

    public CartDto addItemToCart(String userId, AddItemRequest addItemRequest);
}
