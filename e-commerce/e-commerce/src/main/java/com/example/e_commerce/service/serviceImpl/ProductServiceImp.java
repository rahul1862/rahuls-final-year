package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.Helper.Helper;
import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Category;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.repository.CategoryRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.service.ProductService;
import com.example.e_commerce.util.PageableResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImp implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductServiceImp(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
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

    @Override
public ProductDto update(String id, ProductDto productDto) {

            Product product= productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product Not Fount"));
            Product update = productMapper.toUpdate(product, productDto);
            Product save = productRepository.save(update);
            ProductDto productMapperDto = productMapper.toDto(save);
            return productMapperDto;
}



    @Override
    public PageableResponse<ProductDto> getAll(int pageSize, int pageNo, String sortDir, String sortedBy) {

       Sort sort = (sortedBy.equalsIgnoreCase("desc")) ? (Sort.by(sortedBy).descending()) : (Sort.by(sortedBy).ascending());
        PageRequest pageRequest = PageRequest.of(pageNo, pageSize, sort);
        Page<Product> all = productRepository.findAll(pageRequest);
        return Helper.getPageableResponse(all,new ProductMapper());
    }

    @Override
    public ProductDto createProductByCategory(String categoryId, ProductDto productDto) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new ResourceNotFoundException("Category Not Found"));
        Product entity = productMapper.toEntity(productDto);
        entity.setCategory(category);
        Product product = productRepository.save(entity);
        ProductDto productMapperDto = productMapper.toDto(product);
        return productMapperDto;
    }


}
