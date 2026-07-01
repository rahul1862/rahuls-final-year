package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.service.ProductService;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImp implements ProductService {
    private final ProductRepository productRepository;

    private final ProductMapper productMapper;
    public ProductServiceImp(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    public ProductDto save(ProductDto productDto) {
        Product entity = productMapper.toEntity(productDto);
        Product product = productRepository.save(entity);
        ProductDto productMapperDto = productMapper.toDto(product);
        return productMapperDto;
    }

    @Override
    public ProductDto findById(String id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product Not Found."));
        ProductDto productDto = productMapper.toDto(product);
        return productDto;
    }

    @Override
    public void delete(String id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product Not Found."));
        productRepository.deleteById(id);
    }


//
//    @Override
//    public ProductDto update(String id, Product productCorrect) {
//        Product productData = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product Not Found."));
//
//        productData.setProductId(productCorrect.getProductId());
//        productData.setTitle(productCorrect.getTitle());
//        productData.setDescription(productCorrect.getDescription());
//        productData.setQuantity(productCorrect.getQuantity());
//        productData.setLive(productCorrect.getLive());
//        productData.setPrice(productCorrect.getPrice());
//        productData.setStock(productCorrect.getStock());
//        productData.setAddedDate(productCorrect.getAddedDate());
//        productData.setDiscountedPrice(productCorrect.getDiscountedPrice());
//        return productData;
//    }
@Override
public ProductDto update(String id, ProductDto productDto) {
    return null;
}
}
