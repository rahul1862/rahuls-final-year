package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.Users;
import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart,String> {
        Cart findByUsers(Users user);
}
