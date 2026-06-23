package com.example.e_commerce.repository;

import com.example.e_commerce.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users,String> {
}
