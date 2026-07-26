package com.example.e_commerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CartItems {
    @Id
    private String cartItemId;
    private int quantity;
    private int totalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="cart_id")
    private Cart cart;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;

    public void generateId(){
        if (this.cartItemId==null){
           this.cartItemId = UUID.randomUUID().toString();

        }
    }


}
