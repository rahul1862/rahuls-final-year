package com.example.e_commerce.service;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.util.PageableResponse;

public interface ProductService {

    public ProductDto save(ProductDto productDto);
    ProductDto findById(String id);
    void delete(String id);
    ProductDto update (String id, ProductDto productDto);
    public PageableResponse<ProductDto> getAll(int pageSize, int pageNo, String sortDir, String sortedBy);
    ProductDto createProductByCategory(String categoryId, ProductDto productDto);
}
