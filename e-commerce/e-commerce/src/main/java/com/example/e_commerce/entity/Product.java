package com.example.e_commerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Product {
    @Id
    private String productId;
    private String title;
    private String description;
    private double price;
    private double discountedPrice;
    private int quantity;
    private Date addedDate;
    private Boolean stock;
    private Boolean live;

}
