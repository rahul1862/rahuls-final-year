package com.example.e_commerce.service.serviceImpl;

import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.entity.Cart;
import com.example.e_commerce.entity.CartItems;
import com.example.e_commerce.entity.Order;
import com.example.e_commerce.entity.Product;
import com.example.e_commerce.entity.Users;
import com.example.e_commerce.exception.ResourceNotFoundException;
import com.example.e_commerce.mapper.OrderMapper;
import com.example.e_commerce.repository.CartRepository;
import com.example.e_commerce.repository.OrderRepository;
import com.example.e_commerce.repository.UsersRepository;
import com.example.e_commerce.util.CreateOrderRequest;
import com.example.e_commerce.util.PageableResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UsersRepository usersRepository;
    @Mock
    private CartRepository cartRepository;

    private final OrderMapper orderMapper = new OrderMapper();

    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderServiceImpl(orderRepository, orderMapper, usersRepository, cartRepository);
    }

    private Users user(String id) {
        Users u = new Users();
        u.setUserId(id);
        u.setName("Alice");
        return u;
    }

    @Test
    void createOrder_success_computesAmountAndClearsCart() {
        Users user = user("u-1");

        Product product1 = new Product();
        product1.setProductId("p-1");
        product1.setDiscountedPrice(20);

        Product product2 = new Product();
        product2.setProductId("p-2");
        product2.setDiscountedPrice(15);

        CartItems item1 = CartItems.builder().cartItemId("ci-1").quantity(2).product(product1).build();
        CartItems item2 = CartItems.builder().cartItemId("ci-2").quantity(3).product(product2).build();

        Cart cart = new Cart();
        cart.setCartId("cart-1");
        cart.setUsers(user);
        cart.setCartItems(new ArrayList<>(List.of(item1, item2)));

        when(usersRepository.findById("u-1")).thenReturn(Optional.of(user));
        when(cartRepository.findById("cart-1")).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateOrderRequest request = new CreateOrderRequest(
                "u-1", "cart-1", "PENDING", "NOTPAID", "123 Main St", "555-1234", "Alice", null);

        OrderDto result = orderService.createOrder(request);

        assertThat(result.getOrderAmount()).isEqualTo(85);
        assertThat(cart.getCartItems()).isEmpty();
        verify(cartRepository).save(cart);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_userNotFound_throws() {
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId("missing");

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createOrder_cartNotFound_throws() {
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(user("u-1")));
        when(cartRepository.findById("missing-cart")).thenReturn(Optional.empty());

        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId("u-1");
        request.setCartId("missing-cart");

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAll_sortDirPassedAsDesc_actuallySortsAscending() {
        when(orderRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of()));

        orderService.getAll(10, 0, "desc", "orderedDate");

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(orderRepository).findAll(captor.capture());
        Sort.Order order = captor.getValue().getSort().getOrderFor("orderedDate");
        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void getAll_sortDirLiterallyDes_sortsDescending() {
        when(orderRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of()));

        orderService.getAll(10, 0, "des", "orderedDate");

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(orderRepository).findAll(captor.capture());
        Sort.Order order = captor.getValue().getSort().getOrderFor("orderedDate");
        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void getOrderByUserId_found_returnsMappedOrders() {
        Users user = user("u-1");
        Order order = Order.builder().orderId("o-1").orderStatus("PENDING").build();
        when(usersRepository.findById("u-1")).thenReturn(Optional.of(user));
        when(orderRepository.findAllByUsers(user)).thenReturn(List.of(order));

        List<OrderDto> result = orderService.getOrderByUserId("u-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOrderId()).isEqualTo("o-1");
    }

    @Test
    void getOrderByUserId_userNotFound_throws() {
        when(usersRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderByUserId("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_found_deletesById() {
        Order order = Order.builder().orderId("o-1").build();
        when(orderRepository.findById("o-1")).thenReturn(Optional.of(order));

        orderService.delete("o-1");

        verify(orderRepository).deleteById("o-1");
    }

    @Test
    void delete_notFound_throwsAndNeverDeletes() {
        when(orderRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.delete("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(orderRepository, never()).deleteById(any());
    }

    @Test
    void update_found_appliesPartialUpdate() {
        Order existing = Order.builder().orderId("o-1").orderStatus("PENDING").orderAmount(50).build();
        when(orderRepository.findById("o-1")).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto patch = new OrderDto();
        patch.setOrderStatus("SHIPPED");

        OrderDto result = orderService.update("o-1", patch);

        assertThat(result.getOrderStatus()).isEqualTo("SHIPPED");
        assertThat(result.getOrderAmount()).isEqualTo(50);
    }

    @Test
    void update_notFound_throws() {
        when(orderRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.update("missing", new OrderDto()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
