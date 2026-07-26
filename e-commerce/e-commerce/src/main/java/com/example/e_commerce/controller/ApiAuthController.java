package com.example.e_commerce.controller;

import com.example.e_commerce.dto.LoginDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.security.TokenService;
import com.example.e_commerce.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {

    private final UserService userService;
    private final TokenService tokenService;

    public ApiAuthController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required."));
        }

        UserDto dto = new UserDto();
        dto.setName(name);
        dto.setEmail(email);
        dto.setPassword(password);

        try {
            UserDto saved = userService.save(dto);
            return ResponseEntity.ok(authResponse(saved));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");

        try {
            UserDto user = userService.login(new LoginDto(email, password));
            return ResponseEntity.ok(authResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }
    }

    private Map<String, Object> authResponse(UserDto user) {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getUserId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", tokenService.issue(user.getUserId()));
        response.put("user", userMap);
        return response;
    }
}
