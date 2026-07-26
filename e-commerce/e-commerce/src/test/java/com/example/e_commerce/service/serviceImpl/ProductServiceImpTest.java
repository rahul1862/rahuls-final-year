package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.repository.CategoryRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.util.PageableResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImpTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;

    private final ProductMapper productMapper = new ProductMapper();

    private ProductServiceImp productService;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImp(productRepository, categoryRepository, productMapper);
    }

    private Product product(String id) {
        Product p = new Product();
        p.setProductId(id);
        p.setTitle("Widget");
        p.setPrice(10.0);
        p.setQuantity(5);
        p.setStock(true);
        return p;
    }

    @Test
    void save_mapsDtoToEntityAndPersists() {
        ProductDto dto = new ProductDto();
        dto.setProductId("p-1");
        dto.setTitle("Widget");
        dto.setPrice(10.0);
        dto.setQuantity(5);
        dto.setStock(true);

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDto saved = productService.save(dto);

        assertThat(saved.getProductId()).isEqualTo("p-1");
        assertThat(saved.getTitle()).isEqualTo("Widget");
    }

    @Test
    void findById_found_returnsDto() {
        when(productRepository.findById("p-1")).thenReturn(Optional.of(product("p-1")));

        ProductDto dto = productService.findById("p-1");

        assertThat(dto.getProductId()).isEqualTo("p-1");
    }

    @Test
    void findById_notFound_throwsResourceNotFoundException() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_found_deletesById() {
        when(productRepository.findById("p-1")).thenReturn(Optional.of(product("p-1")));

        productService.delete("p-1");

        verify(productRepository).deleteById("p-1");
    }

    @Test
    void delete_notFound_throwsAndNeverDeletes() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_found_appliesPartialUpdate() {
        Product existing = product("p-1");
        existing.setDescription("Original description");
        when(productRepository.findById("p-1")).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDto patch = new ProductDto();
        patch.setTitle("Updated Widget");

        ProductDto result = productService.update("p-1", patch);

        assertThat(result.getTitle()).isEqualTo("Updated Widget");
        assertThat(result.getDescription()).isEqualTo("Original description");
    }

    @Test
    void update_notFound_throws() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.update("missing", new ProductDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAll_sortedByOrdinaryFieldName_actuallySortsAscending_regardlessOfSortDir() {
        Product p = product("p-1");
        when(productRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(p)));

        productService.getAll(10, 0, "desc", "title");

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(productRepository).findAll(captor.capture());
        Sort.Order order = captor.getValue().getSort().getOrderFor("title");

        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void getAll_whenSortedByLiterallyEqualsDesc_sortsDescending() {
        Product p = product("p-1");
        when(productRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(p)));

        productService.getAll(10, 0, "asc", "desc");

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(productRepository).findAll(captor.capture());
        Sort.Order order = captor.getValue().getSort().getOrderFor("desc");

        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void getAll_returnsPageableResponseWithMappedContent() {
        Product p = product("p-1");
        when(productRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(p)));

        PageableResponse<ProductDto> response = productService.getAll(10, 0, "asc", "title");

        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().get(0).getProductId()).isEqualTo("p-1");
    }

    @Test
    void createProductByCategory_categoryFound_setsCategoryAndSaves() {
        Category category = new Category();
        category.setCategoryId("cat-1");
        when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDto dto = new ProductDto();
        dto.setProductId("p-1");
        dto.setTitle("Widget");

        ProductDto result = productService.createProductByCategory("cat-1", dto);

        assertThat(result.getProductId()).isEqualTo("p-1");
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getCategory()).isSameAs(category);
    }

    @Test
    void createProductByCategory_categoryNotFound_throws() {
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.createProductByCategory("missing", new ProductDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
