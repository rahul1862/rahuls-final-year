package com.example.e_commerce.entity;

import com.example.e_commerce.dto.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Users implements UserDetails {
    @Id
    private String userId;
    private String name;
    private String email;
    private String password;
    private String address;
    private String gender;

    private String phone;
    private String city;
    private String zip;
    private String country;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String cartJson;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String wishlistJson;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String ordersJson;

    @OneToMany(mappedBy = "users", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<Order> orders = new ArrayList<>();

    @OneToOne(mappedBy = "users", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private Cart cart;


    @Enumerated(EnumType.STRING)
    private Role role;

    @PrePersist
    public void generateId() {
        if (this.userId == null) {
            this.userId = UUID.randomUUID().toString();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }
}
