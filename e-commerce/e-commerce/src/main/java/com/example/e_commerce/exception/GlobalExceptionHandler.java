package com.example.e_commerce.exception;

import com.example.e_commerce.util.ApiResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
   public ResponseEntity<ApiResponseMessage> resourceNotFoundHandler(ResourceNotFoundException resourceNotFoundException){
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message(resourceNotFoundException.getMessage())
                .status(HttpStatus.NOT_FOUND)
                .data(null)
                .success(true)
                .build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.NOT_FOUND);
    }
}
