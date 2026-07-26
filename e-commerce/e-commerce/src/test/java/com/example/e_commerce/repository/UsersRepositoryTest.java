package com.example.e_commerce.repository;

import com.example.e_commerce.dto.Role;
import com.example.e_commerce.entity.Users;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UsersRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsersRepository usersRepository;

    @Test
    void save_withNoId_autoGeneratesIdViaPrePersist() {
        Users user = new Users();
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPassword("hashed");
        user.setRole(Role.USER);

        Users saved = usersRepository.save(user);
        entityManager.flush();

        assertThat(saved.getUserId()).isNotNull();
    }

    @Test
    void findByEmail_found_returnsUser() {
        Users user = new Users();
        user.setName("Bob");
        user.setEmail("bob@example.com");
        user.setPassword("hashed");
        user.setRole(Role.USER);
        entityManager.persistAndFlush(user);
        entityManager.clear();

        Optional<Users> found = usersRepository.findByEmail("bob@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Bob");
    }

    @Test
    void findByEmail_notFound_returnsEmptyOptional() {
        Optional<Users> found = usersRepository.findByEmail("nobody@example.com");

        assertThat(found).isEmpty();
    }

    @Test
    void findById_afterSave_roundTrips() {
        Users user = new Users();
        user.setName("Carol");
        user.setEmail("carol@example.com");
        user.setPassword("hashed");
        user.setRole(Role.ADMIN);
        Users saved = usersRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        Optional<Users> found = usersRepository.findById(saved.getUserId());

        assertThat(found).isPresent();
        assertThat(found.get().getRole()).isEqualTo(Role.ADMIN);
    }
}
