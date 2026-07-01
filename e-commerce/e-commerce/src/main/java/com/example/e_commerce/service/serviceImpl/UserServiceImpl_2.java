package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.UserMapper;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl_2 implements UserService {
    private final UsersRepository usersRepository;// alt+enter

    private final UserMapper userMapper;
    public UserServiceImpl_2(UsersRepository usersRepository, UserMapper userMapper) {
        this.usersRepository = usersRepository;
        this.userMapper = userMapper;
    }
    @Override
    public UserDto save(UserDto usersDto) {
        Users entity = userMapper.toEntity(usersDto);
        Users save = usersRepository.save(entity);
        UserDto userDto = userMapper.toDto(save);
        return userDto;
    }

    @Override
    public UserDto findById(String id) {
        Users users = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));// 1122
        UserDto userDto = userMapper.toDto(users);
        return userDto;
    }

    @Override
    public void delete(String id) {
        Users users = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));// 1122
        usersRepository.deleteById(id);
    }

//
//    @Override
//    public Users update(String id, Users correctInfo) {
//        Users user = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Found."));// 1122
//        user.setUserId(correctInfo.getUserId());
//        user.setName(correctInfo.getName());
//        user.setEmail(correctInfo.getEmail());
//        user.setAddress(correctInfo.getAddress());
//        user.setGender(correctInfo.getGender());
//        usersRepository.save(user);
//        return user;
//    }
@Override
public UserDto update(String id, UserDto usersDto) {
    return null;
}
}
