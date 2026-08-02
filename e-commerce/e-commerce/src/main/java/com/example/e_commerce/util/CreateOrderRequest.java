package com.example.e_commerce.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderRequest {
    private String userId;
    private String cartId;
    private String orderStatus = "PENDING";
    private String paymentStatus = "NOTPAID";
    private String billingAddress;
    private String billingPhoneNo;
    private String billingName;
    private Date billingDate;

}
