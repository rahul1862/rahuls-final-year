package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.entity.Category;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CategoryMapperTest {

    private final CategoryMapper categoryMapper = new CategoryMapper();

    @Test
    void toEntity_copiesAllFields() {
        CategoryDto dto = new CategoryDto("cat-1", "Electronics", "Electronic goods");

        Category entity = categoryMapper.toEntity(dto);

        assertThat(entity.getCategoryId()).isEqualTo("cat-1");
        assertThat(entity.getTitle()).isEqualTo("Electronics");
        assertThat(entity.getDescription()).isEqualTo("Electronic goods");
    }

    @Test
    void toDto_copiesAllFields() {
        Category entity = new Category();
        entity.setCategoryId("cat-2");
        entity.setTitle("Books");
        entity.setDescription("Reading material");

        CategoryDto dto = categoryMapper.toDto(entity);

        assertThat(dto.getCategoryId()).isEqualTo("cat-2");
        assertThat(dto.getTitle()).isEqualTo("Books");
        assertThat(dto.getDescription()).isEqualTo("Reading material");
    }
}
