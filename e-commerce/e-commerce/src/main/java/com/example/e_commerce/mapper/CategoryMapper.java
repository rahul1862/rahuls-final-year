package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryDto categoryDto){
        Category category = new Category();

        category.setCategoryId(categoryDto.getCategoryId());
        category.setTitle(categoryDto.getTitle());
        category.setDescription(categoryDto.getDescription());
        return category;
    }

    public CategoryDto toDto(Category category){
        CategoryDto categoryDto = new CategoryDto();

        categoryDto.setCategoryId(category.getCategoryId());
        categoryDto.setTitle(category.getTitle());
        categoryDto.setDescription(category.getDescription());
        return categoryDto;
    }
}
