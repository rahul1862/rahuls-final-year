package com.example.e_commerce.service;

import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;

public interface CategoryService {

    public CategoryDto save(CategoryDto categoryDto);
    CategoryDto findById(String id);
    void delete(String id);
    CategoryDto update (String id, CategoryDto categoryDto);


}
