package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.Users;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CartRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CartRepository cartRepository;

    private Users persistUser(String email) {
        Users user = new Users();
        user.setName("Alice");
        user.setEmail(email);
        user.setPassword("hashed");
        entityManager.persistAndFlush(user);
        return user;
    }

    @Test
    void findByUsers_cartExists_returnsCart() {
        Users user = persistUser("alice@example.com");

        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);
        entityManager.persistAndFlush(cart);
        entityManager.clear();

        Users reloaded = entityManager.find(Users.class, user.getUserId());
        Cart found = cartRepository.findByUsers(reloaded);

        assertThat(found).isNotNull();
        assertThat(found.getCartId()).isEqualTo(cart.getCartId());
    }

    @Test
    void findByUsers_noCartForUser_returnsNull() {
        Users user = persistUser("bob@example.com");
        entityManager.clear();

        Users reloaded = entityManager.find(Users.class, user.getUserId());
        Cart found = cartRepository.findByUsers(reloaded);

        assertThat(found).isNull();
    }

    @Test
    void save_andFindById_roundTrips() {
        Users user = persistUser("carol@example.com");

        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        cart.setCreatedAt(new Date());
        cart.setUsers(user);

        Cart saved = cartRepository.save(cart);
        entityManager.flush();
        entityManager.clear();

        assertThat(cartRepository.findById(saved.getCartId())).isPresent();
    }
}
