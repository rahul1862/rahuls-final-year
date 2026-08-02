package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
import org.apache.catalina.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

   public Users toEntity(UserDto userDto ){
       Users users = new Users();
       users.setName(userDto.getName());
       users.setEmail(userDto.getEmail());
       users.setAddress(userDto.getAddress());
       users.setGender(userDto.getGender());
       users.setUserId(userDto.getUserId());
        users.setPassword(userDto.getPassword());
        users.setRole(userDto.getRole());
        return users;
    }

    public UserDto toDto(Users users) {
        UserDto userDto = new UserDto();
        userDto.setName(users.getName());
        userDto.setEmail(users.getEmail());
        userDto.setAddress(users.getAddress());
        userDto.setGender(users.getGender());
        userDto.setUserId(users.getUserId());
        userDto.setPassword(users.getPassword());
        return userDto;
    }

    public Users toUpdate(Users users, UserDto userDto) {

        if (userDto.getName() != null) {
            users.setName(userDto.getName());
        }
        if (userDto.getEmail() != null) {
            users.setEmail(userDto.getEmail());
        }
        if (userDto.getPassword() != null) {
            users.setPassword(userDto.getPassword());
        }
        if (userDto.getAddress() != null) {
            users.setAddress(userDto.getAddress());
        }
        if (userDto.getGender() != null) {
            users.setGender(userDto.getGender());
        }

        return users;
    }
}
