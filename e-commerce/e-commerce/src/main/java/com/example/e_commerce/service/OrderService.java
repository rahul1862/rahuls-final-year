package com.example.e_commerce.service;

import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.util.CreateOrderRequest;
import com.example.e_commerce.util.PageableResponse;

import java.util.List;

public interface OrderService {

    public OrderDto createOrder(CreateOrderRequest orderDto);
    void delete(String id);
    OrderDto update (String id, OrderDto orderDto);
    PageableResponse<OrderDto> getAll(int pageSize,int pageNo,String sortDir,String sortBy);
    public List<OrderDto> getOrderByUserId(String userId);

}
