package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.LoginDto;
import com.example.e_commerce.dto.Role;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.UserMapper;
import com.example.e_commerce.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImpl_2Test {

    @Mock
    private UsersRepository usersRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserMapper userMapper = new UserMapper();

    private UserServiceImpl_2 userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl_2(usersRepository, passwordEncoder, userMapper);
    }

    @Test
    void save_newEmail_encodesPasswordAndPersists() {
        when(usersRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(usersRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto dto = new UserDto();
        dto.setName("Alice");
        dto.setEmail("alice@example.com");
        dto.setPassword("Secret1!");
        dto.setRole(Role.USER);

        UserDto saved = userService.save(dto);

        assertThat(saved.getName()).isEqualTo("Alice");
        assertThat(saved.getEmail()).isEqualTo("alice@example.com");
        assertThat(saved.getPassword()).isNotEqualTo("Secret1!");
        assertThat(passwordEncoder.matches("Secret1!", saved.getPassword())).isTrue();
    }

    @Test
    void save_duplicateEmail_throwsResourceNotFoundException() {
        when(usersRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(new Users()));

        UserDto dto = new UserDto();
        dto.setName("Alice");
        dto.setEmail("alice@example.com");
        dto.setPassword("Secret1!");

        assertThatThrownBy(() -> userService.save(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User is already registered");
    }

    @Test
    void findById_found_returnsDto() {
        Users entity = new Users();
        entity.setUserId("u-1");
        entity.setName("Alice");
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(entity));

        UserDto dto = userService.findById("u-1");

        assertThat(dto.getUserId()).isEqualTo("u-1");
    }

    @Test
    void findById_notFound_throws() {
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_found_deletesById() {
        Users entity = new Users();
        entity.setUserId("u-1");
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(entity));

        userService.delete("u-1");
    }

    @Test
    void delete_notFound_throws() {
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_found_appliesPartialUpdate() {
        Users existing = new Users();
        existing.setUserId("u-1");
        existing.setName("Old Name");
        existing.setEmail("old@example.com");
        existing.setPassword("oldHash");
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(existing));
        when(usersRepository.save(any(Users.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto patch = new UserDto();
        patch.setName("New Name");

        UserDto result = userService.update("u-1", patch);

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getEmail()).isEqualTo("old@example.com");
    }

    @Test
    void update_notFound_throws() {
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.update("missing", new UserDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void login_correctCredentials_returnsDto() {
        Users entity = new Users();
        entity.setUserId("u-1");
        entity.setEmail("alice@example.com");
        entity.setPassword(passwordEncoder.encode("Secret1!"));
        when(usersRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(entity));

        UserDto result = userService.login(new LoginDto("alice@example.com", "Secret1!"));

        assertThat(result.getUserId()).isEqualTo("u-1");
    }

    @Test
    void login_unknownEmail_throwsPlainRuntimeException_notResourceNotFound() {
        when(usersRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(new LoginDto("nobody@example.com", "whatever1!A")))
                .isExactlyInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void login_wrongPassword_throwsPlainRuntimeException() {
        Users entity = new Users();
        entity.setUserId("u-1");
        entity.setEmail("alice@example.com");
        entity.setPassword(passwordEncoder.encode("Secret1!"));
        when(usersRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> userService.login(new LoginDto("alice@example.com", "WrongPass1!")))
                .isExactlyInstanceOf(RuntimeException.class)
                .hasMessage("Invalid password");
    }
}
