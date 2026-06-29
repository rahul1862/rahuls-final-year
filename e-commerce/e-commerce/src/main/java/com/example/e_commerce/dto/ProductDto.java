package com.example.e_commerce.dto;

import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private String productId;
    @NotNull
    private String title;
    private String description;
    @NotNull @Min(1)
    private double price;
    private double discountedPrice;
    @NotNull @Min(1)
    private int quantity;
    private Date addedDate;
    @NotNull
    private Boolean stock;
    private Boolean live;

}
