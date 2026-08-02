package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Order;
import com.example.e_commerce.entity.Users;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private Users persistUser(String email) {
        Users user = new Users();
        user.setName("Alice");
        user.setEmail(email);
        user.setPassword("hashed");
        entityManager.persistAndFlush(user);
        return user;
    }

    @Test
    void findAllByUsers_returnsOrdersForThatUser() {
        Users user = persistUser("alice@example.com");
        Users otherUser = persistUser("other@example.com");

        Order order1 = Order.builder()
                .orderId(UUID.randomUUID().toString())
                .orderStatus("PENDING")
                .users(user)
                .build();
        Order order2 = Order.builder()
                .orderId(UUID.randomUUID().toString())
                .orderStatus("DELIVERED")
                .users(user)
                .build();
        Order otherOrder = Order.builder()
                .orderId(UUID.randomUUID().toString())
                .orderStatus("PENDING")
                .users(otherUser)
                .build();

        entityManager.persist(order1);
        entityManager.persist(order2);
        entityManager.persist(otherOrder);
        entityManager.flush();
        entityManager.clear();

        Users reloaded = entityManager.find(Users.class, user.getUserId());
        List<Order> orders = orderRepository.findAllByUsers(reloaded);

        assertThat(orders).hasSize(2);
        assertThat(orders).extracting(Order::getOrderId)
                .containsExactlyInAnyOrder(order1.getOrderId(), order2.getOrderId());
    }

    @Test
    void findAllByUsers_userWithNoOrders_returnsEmptyList() {
        Users user = persistUser("bob@example.com");
        entityManager.clear();

        Users reloaded = entityManager.find(Users.class, user.getUserId());
        List<Order> orders = orderRepository.findAllByUsers(reloaded);

        assertThat(orders).isEmpty();
    }

    @Test
    void save_andFindById_roundTrips() {
        Users user = persistUser("carol@example.com");

        Order order = Order.builder()
                .orderId(UUID.randomUUID().toString())
                .orderStatus("PENDING")
                .orderAmount(100)
                .users(user)
                .build();

        Order saved = orderRepository.save(order);
        entityManager.flush();
        entityManager.clear();

        assertThat(orderRepository.findById(saved.getOrderId())).isPresent();
    }
}
