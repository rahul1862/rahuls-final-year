package com.example.e_commerce.service;

import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;

public interface UserService {

    public UserDto save(UserDto usersDto);
    UserDto findById(String id);
    void delete(String id);
    UserDto update (String id, UserDto usersDto);

}
