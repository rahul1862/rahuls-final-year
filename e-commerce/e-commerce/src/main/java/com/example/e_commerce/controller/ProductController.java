package com.example.e_commerce.controller;

import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.service.ProductService;
import com.example.e_commerce.util.ApiResponseMessage;
import com.example.e_commerce.util.PageableResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping(value = "/product")
public class ProductController {

    private final ProductService productService;
    @Value("${product.profile.image.path}")
    private String imagePath;
    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseMessage> create(@Valid @RequestBody ProductDto productDto){
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
    @GetMapping
    public ResponseEntity getAll(
            @RequestParam(value = "pageSize", defaultValue = "10",required = false) int pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0",required = false) int pageNo,
            @RequestParam(value = "sortDir",defaultValue = "dec", required = false) String sortDir,
            @RequestParam(value = "sortedBy",defaultValue = "title",required = false)String sortedBy
    ){
        PageableResponse<ProductDto> products = productService.getAll(pageSize,pageNo,sortDir,sortedBy);
            return new ResponseEntity<>(products,HttpStatus.OK);
        }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> update (@PathVariable String id,@RequestBody ProductDto productDto){

        ProductDto update = productService.update(id, productDto);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Updated Success")
                .status(HttpStatus.OK)
                .success(true)
                .data(update)
                .build();
        return  new ResponseEntity<>(apiResponseMessage, HttpStatus.OK);
    }


    @PostMapping("/image/{id}")
    public ResponseEntity<String> uploadImage(@RequestParam("productImage") MultipartFile file,
            @PathVariable String id) throws IOException {

        ProductDto productDto = productService.findById(id);
        productDto.setImage(file.getBytes());

        productService.update(id, productDto);

        return ResponseEntity.ok("Image saved in DB successfully!");
    }



    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable String id){

        ProductDto byId = productService.findById(id);
        return ResponseEntity.ok()
                .header("Content-Type","image/png")
                .body(byId.getImage());
    }


}
