package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.CartDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.CartMapper;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.service.CartService;
import com.example.e_commerce.util.AddItemRequest;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;

import javax.xml.crypto.Data;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
@Service
public class CartServiceImpl implements CartService {
    private final ProductRepository productRepository;
    private final UsersRepository usersRepository;
    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    public CartServiceImpl(ProductRepository productRepository, UsersRepository usersRepository, CartRepository cartRepository, CartMapper cartMapper) {
        this.productRepository = productRepository;
        this.usersRepository = usersRepository;
        this.cartRepository = cartRepository;
        this.cartMapper = cartMapper;

    }


    @Override
    public CartDto addItemToCart(String userId, AddItemRequest addItemRequest) {
        String productId = addItemRequest.getProductId();
        int quantity = addItemRequest.getQuantity();
        Product foundProduct = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product Not Found"));
        Users foundUser = usersRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        Cart cart = null;

       try {
           cart = cartRepository.findByUsers(foundUser);
       }catch (Exception e){
           cart = new Cart();
           cart.setCartId(UUID.randomUUID().toString());
           cart.setCreatedAt(new Date());
           cart.setUsers(foundUser);
       }

        AtomicReference<Boolean> update  = new AtomicReference<>(false);

        List<CartItems> cartItems = cart.getCartItems();
        cartItems.stream().map(cartItem -> {
            if (cartItem.getProduct().getProductId().equals(productId)) {
                int existingQuantity = cartItem.getQuantity();
                int newQuantity = existingQuantity + quantity;
                cartItem.setQuantity(newQuantity);
                cartItem.setTotalPrice(newQuantity*cartItem.getProduct().getDiscountedPrice());
                update.set(true);
            }
            return cartItem;
        }).collect(Collectors.toList());

        if (!update.get()){

            CartItems newCartItems = CartItems.builder()
                    .cartItemId(java.util.UUID.randomUUID().toString())
                    .quantity(quantity)
                    .totalPrice(quantity * (foundProduct.getDiscountedPrice()))
                    .cart(cart)
                    .product(foundProduct).build();
            cart.getCartItems().add(newCartItems);
        }

        Cart save = cartRepository.save(cart);

        return cartMapper.toDto(save);
    }
}
