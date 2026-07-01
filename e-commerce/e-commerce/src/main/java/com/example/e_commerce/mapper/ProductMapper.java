package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {


    public Product toEntity(ProductDto productDto){
        Product product = new Product();

        product.setProductId(productDto.getProductId());
        product.setLive(productDto.getLive());
        product.setPrice(productDto.getPrice());
        product.setQuantity(productDto.getQuantity());
        product.setStock(productDto.getStock());
        product.setDescription(productDto.getDescription());
        product.setTitle(productDto.getTitle());
        product.setDiscountedPrice(productDto.getDiscountedPrice());
        product.setAddedDate(productDto.getAddedDate());

        return product;
    }

    public ProductDto toDto(Product product) {
        {
            ProductDto productDto = new ProductDto();

            productDto.setProductId(product.getProductId());
            productDto.setLive(product.getLive());
            productDto.setPrice(product.getPrice());
            productDto.setQuantity(product.getQuantity());
            productDto.setStock(product.getStock());
            productDto.setDescription(product.getDescription());
            productDto.setTitle(product.getTitle());
            productDto.setDiscountedPrice(product.getDiscountedPrice());
            productDto.setAddedDate(product.getAddedDate());
            return productDto;
        }


    }
}
