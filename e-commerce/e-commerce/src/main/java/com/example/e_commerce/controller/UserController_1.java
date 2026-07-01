package com.example.e_commerce.controller;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.service.serviceImpl.UserServiceImpl_2;
import com.example.e_commerce.util.ApiResponseMessage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/users")
public class UserController_1 {

    private final UserServiceImpl_2 userService;

    public UserController_1(UserServiceImpl_2 userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseMessage> create(@Valid @RequestBody UserDto usersDto) {// 112  Rahul Edinburg
        UserDto saved = userService.save(usersDto);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder().message("Created").status(HttpStatus.OK).success(true).data(saved).build();

        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> findbyId(@PathVariable String id) {
        UserDto byId = userService.findById(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Found")
                .data(byId)
                .status(HttpStatus.OK)
                .success(true)
                .build();
        return new ResponseEntity<>(apiResponseMessage, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> delete(@PathVariable String id) {
        userService.delete(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .data(null)
                .message("Deleted")
                .status(HttpStatus.OK)
                .success(true)
                .build();

        return new ResponseEntity<>(apiResponseMessage, HttpStatus.OK);
    }


}
