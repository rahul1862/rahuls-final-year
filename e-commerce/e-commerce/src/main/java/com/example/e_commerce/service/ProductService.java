package com.example.e_commerce.service;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;

public interface ProductService {

    public ProductDto save(ProductDto productDto);
    ProductDto findById(String id);
    void delete(String id);
    ProductDto update (String id, ProductDto productDto);
}
