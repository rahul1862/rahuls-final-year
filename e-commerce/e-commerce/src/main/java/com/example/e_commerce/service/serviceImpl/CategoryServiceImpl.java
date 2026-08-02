package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.CategoryMapper;
import com.example.e_commerce.repository.CategoryRepository;
import com.example.e_commerce.service.CategoryService;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public CategoryDto save(CategoryDto categoryDto) {
        Category entity = categoryMapper.toEntity(categoryDto);
        Category save = categoryRepository.save(entity);
        return categoryMapper.toDto(save);
    }

    @Override
    public CategoryDto findById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category Not Found"));
        CategoryDto categoryDto = categoryMapper.toDto(category);
        return categoryDto;
    }

    @Override
    public void delete(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category Not Found"));
        categoryRepository.deleteById(id);
    }

    @Override
    public CategoryDto update(String id, CategoryDto categoryDto) {
        return null;
    }


}
