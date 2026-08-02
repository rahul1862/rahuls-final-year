package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper implements Mapper<Product,ProductDto> {


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
        product.setImage(productDto.getImage());
        product.setRating(productDto.getRating());
        product.setReviews(productDto.getReviews());
        product.setCountry(productDto.getCountry());
        product.setFlag(productDto.getFlag());
        product.setImageUrl(productDto.getImageUrl());

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
            productDto.setImage(product.getImage());
            productDto.setRating(product.getRating());
            productDto.setReviews(product.getReviews());
            productDto.setCountry(product.getCountry());
            productDto.setFlag(product.getFlag());
            productDto.setImageUrl(product.getImageUrl());
            productDto.setCategory(product.getCategory() != null ? product.getCategory().getTitle() : null);
            return productDto;
        }


    }

    public Product toUpdate(Product product, ProductDto productDto) {

        if (productDto.getTitle() != null) {
            product.setTitle(productDto.getTitle());
        }

        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }

        if (productDto.getPrice() != 0) {
            product.setPrice(productDto.getPrice());
        }

        if (productDto.getDiscountedPrice() != 0) {
            product.setDiscountedPrice(productDto.getDiscountedPrice());
        }

        if (productDto.getQuantity() != 0) {
            product.setQuantity(productDto.getQuantity());
        }

        if (productDto.getAddedDate() != null) {
            product.setAddedDate(productDto.getAddedDate());
        }

        if (productDto.getStock() != null) {
            product.setStock(productDto.getStock());
        }

        if (productDto.getLive() != null) {
            product.setLive(productDto.getLive());
        }

        if (productDto.getImage() != null) {
            product.setImage(productDto.getImage());
        }

        if (productDto.getRating() != null) {
            product.setRating(productDto.getRating());
        }

        if (productDto.getReviews() != null) {
            product.setReviews(productDto.getReviews());
        }

        if (productDto.getCountry() != null) {
            product.setCountry(productDto.getCountry());
        }

        if (productDto.getFlag() != null) {
            product.setFlag(productDto.getFlag());
        }

        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }

        return product;
    }
}
