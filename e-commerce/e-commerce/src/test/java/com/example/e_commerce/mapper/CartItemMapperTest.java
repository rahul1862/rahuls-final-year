package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.dto.CartItemDto;
import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CartItemMapperTest {

    private final ProductMapper productMapper = new ProductMapper();
    private final CartItemMapper cartItemMapper = new CartItemMapper(productMapper);

    @Test
    void toEntity_copiesFieldsAndConvertsProduct() {
        ProductDto productDto = new ProductDto();
        productDto.setProductId("p-1");
        productDto.setTitle("Widget");

        CartItemDto dto = CartItemDto.builder()
                .cartItemId("ci-1")
                .quantity(4)
                .totalPrice(80)
                .productDto(productDto)
                .build();

        CartItems entity = cartItemMapper.toEntity(dto);

        assertThat(entity.getCartItemId()).isEqualTo("ci-1");
        assertThat(entity.getQuantity()).isEqualTo(4);
        assertThat(entity.getTotalPrice()).isEqualTo(80);
        assertThat(entity.getProduct().getProductId()).isEqualTo("p-1");
        assertThat(entity.getCart()).isNull();
    }

    @Test
    void toDto_copiesFieldsAndConvertsProduct() {
        Product product = new Product();
        product.setProductId("p-2");
        product.setTitle("Gadget");

        CartItems entity = CartItems.builder()
                .cartItemId("ci-2")
                .quantity(2)
                .totalPrice(50)
                .product(product)
                .build();

        CartItemDto dto = cartItemMapper.toDto(entity);

        assertThat(dto.getCartItemId()).isEqualTo("ci-2");
        assertThat(dto.getQuantity()).isEqualTo(2);
        assertThat(dto.getTotalPrice()).isEqualTo(50);
        assertThat(dto.getProductDto().getProductId()).isEqualTo("p-2");
    }

    @Test
    void toDto_cartDtoIsAlwaysNull_dueToSelfAssignmentTypo() {
        Product product = new Product();
        product.setProductId("p-3");

        CartItems entity = CartItems.builder()
                .cartItemId("ci-3")
                .quantity(1)
                .totalPrice(10)
                .product(product)
                .build();

        CartItemDto dto = cartItemMapper.toDto(entity);

        assertThat(dto.getCartDto()).isNull();
    }

    @Test
    void toDtoList_mapsEachItem() {
        Product product = new Product();
        product.setProductId("p-4");

        CartItems first = CartItems.builder().cartItemId("ci-4").product(product).build();
        CartItems second = CartItems.builder().cartItemId("ci-5").product(product).build();

        List<CartItemDto> dtos = cartItemMapper.toDtoList(List.of(first, second));

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getCartItemId()).isEqualTo("ci-4");
        assertThat(dtos.get(1).getCartItemId()).isEqualTo("ci-5");
    }
}
