package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
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
}
