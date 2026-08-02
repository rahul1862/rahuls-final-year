package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.CategoryMapper;
import com.example.e_commerce.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    private final CategoryMapper categoryMapper = new CategoryMapper();

    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryServiceImpl(categoryRepository, categoryMapper);
    }

    @Test
    void save_mapsAndPersists() {
        Category saved = new Category();
        saved.setCategoryId("cat-1");
        saved.setTitle("Electronics");
        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        CategoryDto dto = new CategoryDto();
        dto.setCategoryId("cat-1");
        dto.setTitle("Electronics");

        CategoryDto result = categoryService.save(dto);

        assertThat(result.getCategoryId()).isEqualTo("cat-1");
        assertThat(result.getTitle()).isEqualTo("Electronics");
    }

    @Test
    void findById_found_returnsDto() {
        Category category = new Category();
        category.setCategoryId("cat-1");
        category.setTitle("Electronics");
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));

        CategoryDto dto = categoryService.findById("cat-1");

        assertThat(dto.getCategoryId()).isEqualTo("cat-1");
    }

    @Test
    void findById_notFound_throws() {
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_found_deletesById() {
        Category category = new Category();
        category.setCategoryId("cat-1");
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));

        categoryService.delete("cat-1");

        verify(categoryRepository).deleteById("cat-1");
    }

    @Test
    void delete_notFound_throwsAndNeverDeletes() {
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    void update_isUnimplementedStub_alwaysReturnsNullAndNeverTouchesRepository() {
        CategoryDto patch = new CategoryDto();
        patch.setTitle("New Title");

        CategoryDto result = categoryService.update("any-id", patch);

        assertThat(result).isNull();
        verifyNoInteractions(categoryRepository);
    }
}
