package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.Helper.Helper;
import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.entity.*;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.OrderMapper;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.OrderRepository;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.service.OrderService;
import com.example.e_commerce.util.CreateOrderRequest;
import com.example.e_commerce.util.PageableResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    final private OrderRepository orderRepository;

    final private OrderMapper orderMapper;

    final private UsersRepository usersRepository;
    final private CartRepository cartRepository;
    public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper, UsersRepository usersRepository, CartRepository cartRepository) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.usersRepository = usersRepository;
        this.cartRepository = cartRepository;
    }
    @Override
    public OrderDto createOrder(CreateOrderRequest orderDto) {

        String userId = orderDto.getUserId();
        String cartId = orderDto.getCartId();

        Users user = usersRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with given id!!"));
        Cart cart = cartRepository.findById(cartId).orElseThrow(() -> new ResourceNotFoundException("Cart not found with given card id"));

        List<CartItems> cartItems = cart.getCartItems();

        Order order = Order.builder()
                .orderStatus(orderDto.getOrderStatus())
                .paymentStatus(orderDto.getPaymentStatus())
                .billingAddress(orderDto.getBillingAddress())
                .billingPhone(orderDto.getBillingPhoneNo())
                .billingName(orderDto.getBillingName())
                .orderId(UUID.randomUUID().toString())
                .orderedDate(new Date())
                .deliveredDate(null)
                .users(user)
                .orderAmount(0)
                .build();


        AtomicReference<Integer> orderAmount = new AtomicReference<>(0);
        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {

            OrderItem orderItem = OrderItem.builder()
                    .quantity(cartItem.getQuantity())
                    .product(cartItem.getProduct())
                    .totalPrice(cartItem.getQuantity() * cartItem.getProduct().getDiscountedPrice())
                    .order(order)
                    .build();
            orderAmount.set(orderAmount.get() + orderItem.getTotalPrice());
            return orderItem;
        }).collect(Collectors.toList());

        order.setOrderItems(orderItems);
        order.setOrderAmount(orderAmount.get());

        cart.getCartItems().clear();
        cartRepository.save(cart);
        Order savedOrder = orderRepository.save(order);

        return orderMapper.toDto(savedOrder);
    }



    @Override
    public PageableResponse<OrderDto> getAll(int pageSize, int pageNo, String sortDir, String sortBy) {

        Sort sort =(sortDir.equalsIgnoreCase("des"))? (Sort.by(sortBy).descending()) : (Sort.by(sortBy).ascending());
        PageRequest pageRequest = PageRequest.of(pageNo, pageSize, sort);
        Page<Order> all = orderRepository.findAll(pageRequest);
        return Helper.getPageableResponse(all,orderMapper);

    }


    @Override
    public List<OrderDto> getOrderByUserId(String userId) {
        Users users = usersRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
        List<Order> allByUsers = orderRepository.findAllByUsers(users);
        List<OrderDto> dtoList = orderMapper.toDtoList(allByUsers);
        return dtoList;
    }

    @Override
    public void delete(String id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));
        orderRepository.deleteById(id);
    }

    @Override
    public OrderDto update(String id, OrderDto orderDto) {
        Order order= orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order Not Fount"));
        Order update = orderMapper.toUpdate(order, orderDto);
        Order save = orderRepository.save(update);
        OrderDto orderDtoResult = orderMapper.toDto(save);
        return orderDtoResult;

    }
}
