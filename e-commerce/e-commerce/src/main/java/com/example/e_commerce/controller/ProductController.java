package com.example.e_commerce.controller;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.service.ProductService;
import com.example.e_commerce.util.ApiResponseMessage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping(value = "/product")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseMessage> create(@Valid @RequestBody ProductDto productDto){// 112  Rahul Edinburg
        ProductDto saved = productService.save(productDto);
        ApiResponseMessage apiResponseMessage = new ApiResponseMessage().builder()
                .message("Product Saved")
                .status(HttpStatus.OK)
                .success(true)
                .data(saved)
                .build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> findbyId(@PathVariable String id){
        ProductDto byId = productService.findById(id);
        ApiResponseMessage apiResponseMessage = new ApiResponseMessage().builder()
                .message("Product Fetched")
                .status(HttpStatus.OK)
                .success(true)
                .data(byId).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> delete(@PathVariable String id){
        productService.delete(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder().message("Deleted").status(HttpStatus.OK).success(true).data(null).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }


}
