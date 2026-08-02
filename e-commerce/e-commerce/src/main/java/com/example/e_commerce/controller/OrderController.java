package com.example.e_commerce.controller;

import com.example.e_commerce.dto.OrderDto;
import com.example.e_commerce.dto.ProductDto;
import com.example.e_commerce.service.OrderService;
import com.example.e_commerce.util.ApiResponseMessage;
import com.example.e_commerce.util.CreateOrderRequest;
import com.example.e_commerce.util.PageableResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseMessage> create(@Valid  @RequestBody CreateOrderRequest createOrderRequest){
        OrderDto orderDto1 = orderService.createOrder(createOrderRequest);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder()
                .message("Order Generated Successfully")
                .status(HttpStatus.OK)
                .success(true)
                .data(orderDto1)
                .build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> findOrderByUserId(@PathVariable String userId){
        List<OrderDto> orderByUserId = orderService.getOrderByUserId(userId);
        ApiResponseMessage apiResponseMessage = new ApiResponseMessage().builder()
                .message("Order Fetched")
                .status(HttpStatus.OK)
                .success(true)
                .data(orderByUserId).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity getAll(
            @RequestParam(value = "pageSize", defaultValue = "10",required = false) int pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0",required = false) int pageNo,
            @RequestParam(value = "sortDir",defaultValue = "desc", required = false) String sortDir,
            @RequestParam(value = "sortedBy",defaultValue = "orderedDate",required = false) String sortedBy
    ){
        PageableResponse<OrderDto> orders = orderService.getAll(pageSize,pageNo,sortDir,sortedBy);
        return new ResponseEntity<>(orders,HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseMessage> delete(@PathVariable String id){
        orderService.delete(id);
        ApiResponseMessage apiResponseMessage = ApiResponseMessage.builder().message("Deleted").status(HttpStatus.OK).success(true).data(null).build();
        return new ResponseEntity<>(apiResponseMessage,HttpStatus.OK);
    }
}
