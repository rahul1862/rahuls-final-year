package com.example.e_commerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {
    @NotNull
    private String orderId;
    private String orderStatus;
    private String paymentStatus;
    private int orderAmount;
    @NotNull
    private String billingAddress;
    @NotNull
    private String billingPhone;
    private Date billingDate;
    private Date deliveryDate;

}
