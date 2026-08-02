package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.LoginDto;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.UserMapper;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl_2 implements UserService {
    ;
    @Autowired
private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;
    private final UsersRepository usersRepository;
    public UserServiceImpl_2(UsersRepository usersRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }
    @Override
    public UserDto save(UserDto usersDto) {
        Optional<Users> byEmail = usersRepository.findByEmail(usersDto.getEmail());

        if (byEmail.isPresent()){
            throw new ResourceNotFoundException("User is already registered");
        }
        Users entity = userMapper.toEntity(usersDto);
        entity.setPassword(passwordEncoder.encode(usersDto.getPassword()));
        Users save = usersRepository.save(entity);
        UserDto userDto = userMapper.toDto(save);
        return userDto;
    }

    @Override
    public UserDto findById(String id) {
        Users users = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
        UserDto userDto = userMapper.toDto(users);
        return userDto;
    }

    @Override
    public void delete(String id) {
        Users users = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
        usersRepository.deleteById(id);
    }

@Override
public UserDto update(String id, UserDto usersDto) {
        Users users = usersRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User Not Fount"));
    Users update = userMapper.toUpdate(users, usersDto);
    Users save = usersRepository.save(update);
    UserDto userDto = userMapper.toDto(save);
    return userDto;
}

    public UserDto login(LoginDto loginDto) {

        Users user = usersRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return userMapper.toDto(user);
    }
}
