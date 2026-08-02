package com.example.e_commerce.util;

import lombok.*;
import org.springframework.http.HttpStatus;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponseMessage {
    private String message;
    private HttpStatus status;
    private boolean success;
    private Object data;
}
