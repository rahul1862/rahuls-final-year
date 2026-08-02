package com.example.e_commerce.controller;

import com.example.e_commerce.dto.LoginDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.service.UserService;
import com.example.e_commerce.util.ApiResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;


    public AuthController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping
    public ResponseEntity<ApiResponseMessage> registerUser(@RequestBody UserDto userDto){
        UserDto saved = userService.save(userDto);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Registered Successfully")
                .status(HttpStatus.OK)
                .success(true)
                .data(saved).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);

    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponseMessage> loginUser(@RequestBody LoginDto loginDto){

        UserDto user = userService.login(loginDto);

        return new ResponseEntity<>(
                new ApiResponseMessage("Login Successful", HttpStatus.OK, true, user),
                HttpStatus.OK
        );
    }




}
