package com.example.e_commerce.controller;
import com.example.e_commerce.dto.CategoryDto;
import com.example.e_commerce.mapper.CategoryMapper;
import com.example.e_commerce.service.CategoryService;
import com.example.e_commerce.util.ApiResponseMessage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService, CategoryMapper categoryMapper) {
        this.categoryService = categoryService;
    }


    @PostMapping
   public ResponseEntity<ApiResponseMessage> create(@Valid @RequestBody CategoryDto categoryDto){
        CategoryDto saved = categoryService.save(categoryDto);

        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Category Created")
                .data(saved)
                .success(true)
                .status(HttpStatus.OK).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> findById(@PathVariable String id){
        CategoryDto byId = categoryService.findById(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Category Fetched")
                .status(HttpStatus.OK)
                .success(true)
                .data(byId)
                .build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> delete(@PathVariable String id){
        categoryService.delete(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Deleted Success")
                .status(HttpStatus.OK)
                .success(true)
                .data(null)
                .build();
        return  new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

}
