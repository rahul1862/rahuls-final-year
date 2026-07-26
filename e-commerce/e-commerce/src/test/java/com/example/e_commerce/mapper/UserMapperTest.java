package com.example.e_commerce.mapper;

import com.example.e_commerce.dto.Role;
import com.example.e_commerce.dto.UserDto;
import com.example.e_commerce.entity.Users;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private final UserMapper userMapper = new UserMapper();

    @Test
    void toEntity_copiesCoreFieldsIncludingRole() {
        UserDto dto = new UserDto("u-1", "Alice", "alice@example.com", "123 Main St", "F", "Secret1!", Role.ADMIN);

        Users entity = userMapper.toEntity(dto);

        assertThat(entity.getUserId()).isEqualTo("u-1");
        assertThat(entity.getName()).isEqualTo("Alice");
        assertThat(entity.getEmail()).isEqualTo("alice@example.com");
        assertThat(entity.getAddress()).isEqualTo("123 Main St");
        assertThat(entity.getGender()).isEqualTo("F");
        assertThat(entity.getPassword()).isEqualTo("Secret1!");
        assertThat(entity.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void toDto_copiesPasswordVerbatimWithoutRedaction() {
        Users entity = new Users();
        entity.setUserId("u-2");
        entity.setName("Bob");
        entity.setEmail("bob@example.com");
        entity.setAddress("456 Side St");
        entity.setGender("M");
        entity.setPassword("$2a$10$bcryptHashLooksLikeThis");
        entity.setRole(Role.ADMIN);

        UserDto dto = userMapper.toDto(entity);

        assertThat(dto.getUserId()).isEqualTo("u-2");
        assertThat(dto.getName()).isEqualTo("Bob");
        assertThat(dto.getEmail()).isEqualTo("bob@example.com");
        assertThat(dto.getAddress()).isEqualTo("456 Side St");
        assertThat(dto.getGender()).isEqualTo("M");
        assertThat(dto.getPassword()).isEqualTo("$2a$10$bcryptHashLooksLikeThis");
    }

    @Test
    void toDto_doesNotCopyRole_alwaysDefaultsToUser() {
        Users adminEntity = new Users();
        adminEntity.setUserId("u-3");
        adminEntity.setName("Carol");
        adminEntity.setEmail("carol@example.com");
        adminEntity.setPassword("hash");
        adminEntity.setRole(Role.ADMIN);

        UserDto dto = userMapper.toDto(adminEntity);

        assertThat(dto.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void toUpdate_withPartialDto_preservesOmittedFields_andNeverTouchesRole() {
        Users existing = new Users();
        existing.setUserId("u-4");
        existing.setName("Original Name");
        existing.setEmail("original@example.com");
        existing.setPassword("originalPass");
        existing.setAddress("Original Address");
        existing.setGender("F");
        existing.setRole(Role.ADMIN);

        UserDto patch = new UserDto();
        patch.setName("Updated Name");

        Users updated = userMapper.toUpdate(existing, patch);

        assertThat(updated.getName()).isEqualTo("Updated Name");
        assertThat(updated.getEmail()).isEqualTo("original@example.com");
        assertThat(updated.getPassword()).isEqualTo("originalPass");
        assertThat(updated.getAddress()).isEqualTo("Original Address");
        assertThat(updated.getGender()).isEqualTo("F");
        assertThat(updated.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void toUpdate_withAllFieldsPresent_overwritesEditableFields() {
        Users existing = new Users();
        existing.setUserId("u-5");
        existing.setName("Old");
        existing.setEmail("old@example.com");
        existing.setPassword("oldPass");
        existing.setAddress("Old Address");
        existing.setGender("M");

        UserDto patch = new UserDto("ignored-id", "New", "new@example.com", "New Address", "F", "NewPass1!", Role.USER);

        Users updated = userMapper.toUpdate(existing, patch);

        assertThat(updated.getName()).isEqualTo("New");
        assertThat(updated.getEmail()).isEqualTo("new@example.com");
        assertThat(updated.getPassword()).isEqualTo("NewPass1!");
        assertThat(updated.getAddress()).isEqualTo("New Address");
        assertThat(updated.getGender()).isEqualTo("F");
        assertThat(updated.getUserId()).isEqualTo("u-5");
    }
}
