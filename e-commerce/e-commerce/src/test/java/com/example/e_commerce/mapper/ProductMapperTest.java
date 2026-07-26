package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class ProductMapperTest {

    private final ProductMapper productMapper = new ProductMapper();

    private ProductDto fullDto() {
        ProductDto dto = new ProductDto();
        dto.setProductId("p-1");
        dto.setTitle("Widget");
        dto.setDescription("A widget");
        dto.setPrice(100.0);
        dto.setDiscountedPrice(80);
        dto.setQuantity(5);
        dto.setAddedDate(new Date(1_700_000_000_000L));
        dto.setStock(true);
        dto.setLive(true);
        dto.setImage(new byte[]{1, 2, 3});
        return dto;
    }

    @Test
    void toEntity_copiesAllFields() {
        ProductDto dto = fullDto();

        Product entity = productMapper.toEntity(dto);

        assertThat(entity.getProductId()).isEqualTo(dto.getProductId());
        assertThat(entity.getTitle()).isEqualTo(dto.getTitle());
        assertThat(entity.getDescription()).isEqualTo(dto.getDescription());
        assertThat(entity.getPrice()).isEqualTo(dto.getPrice());
        assertThat(entity.getDiscountedPrice()).isEqualTo(dto.getDiscountedPrice());
        assertThat(entity.getQuantity()).isEqualTo(dto.getQuantity());
        assertThat(entity.getAddedDate()).isEqualTo(dto.getAddedDate());
        assertThat(entity.getStock()).isEqualTo(dto.getStock());
        assertThat(entity.getLive()).isEqualTo(dto.getLive());
        assertThat(entity.getImage()).isEqualTo(dto.getImage());
    }

    @Test
    void toDto_copiesAllFields() {
        Product entity = new Product();
        entity.setProductId("p-2");
        entity.setTitle("Gadget");
        entity.setDescription("A gadget");
        entity.setPrice(50.0);
        entity.setDiscountedPrice(40);
        entity.setQuantity(3);
        entity.setAddedDate(new Date(1_700_000_000_000L));
        entity.setStock(false);
        entity.setLive(false);
        entity.setImage(new byte[]{9, 8, 7});

        ProductDto dto = productMapper.toDto(entity);

        assertThat(dto.getProductId()).isEqualTo(entity.getProductId());
        assertThat(dto.getTitle()).isEqualTo(entity.getTitle());
        assertThat(dto.getDescription()).isEqualTo(entity.getDescription());
        assertThat(dto.getPrice()).isEqualTo(entity.getPrice());
        assertThat(dto.getDiscountedPrice()).isEqualTo(entity.getDiscountedPrice());
        assertThat(dto.getQuantity()).isEqualTo(entity.getQuantity());
        assertThat(dto.getAddedDate()).isEqualTo(entity.getAddedDate());
        assertThat(dto.getStock()).isEqualTo(entity.getStock());
        assertThat(dto.getLive()).isEqualTo(entity.getLive());
        assertThat(dto.getImage()).isEqualTo(entity.getImage());
    }

    @Test
    void toUpdate_withAllFieldsPresent_overwritesEverything() {
        Product existing = new Product();
        existing.setProductId("p-3");
        existing.setTitle("Old title");
        existing.setDescription("Old desc");
        existing.setPrice(10.0);
        existing.setDiscountedPrice(8);
        existing.setQuantity(1);
        existing.setStock(false);
        existing.setLive(false);

        ProductDto patch = fullDto();
        patch.setProductId(null);

        Product updated = productMapper.toUpdate(existing, patch);

        assertThat(updated.getTitle()).isEqualTo(patch.getTitle());
        assertThat(updated.getDescription()).isEqualTo(patch.getDescription());
        assertThat(updated.getPrice()).isEqualTo(patch.getPrice());
        assertThat(updated.getDiscountedPrice()).isEqualTo(patch.getDiscountedPrice());
        assertThat(updated.getQuantity()).isEqualTo(patch.getQuantity());
        assertThat(updated.getStock()).isEqualTo(patch.getStock());
        assertThat(updated.getLive()).isEqualTo(patch.getLive());
    }

    @Test
    void toUpdate_withPartialDto_preservesOmittedFields() {
        Product existing = new Product();
        existing.setProductId("p-4");
        existing.setTitle("Keep this title");
        existing.setDescription("Keep this description");
        existing.setPrice(99.5);
        existing.setDiscountedPrice(77);
        existing.setQuantity(42);
        existing.setStock(true);
        existing.setLive(true);
        existing.setImage(new byte[]{5, 5, 5});

        ProductDto patch = new ProductDto();
        patch.setTitle("New title only");

        Product updated = productMapper.toUpdate(existing, patch);

        assertThat(updated.getTitle()).isEqualTo("New title only");
        assertThat(updated.getDescription()).isEqualTo("Keep this description");
        assertThat(updated.getPrice()).isEqualTo(99.5);
        assertThat(updated.getDiscountedPrice()).isEqualTo(77);
        assertThat(updated.getQuantity()).isEqualTo(42);
        assertThat(updated.getStock()).isTrue();
        assertThat(updated.getLive()).isTrue();
        assertThat(updated.getImage()).containsExactly(5, 5, 5);
    }
}
