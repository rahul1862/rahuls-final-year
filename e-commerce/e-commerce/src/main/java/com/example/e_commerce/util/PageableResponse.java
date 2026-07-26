package com.example.e_commerce.util;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageableResponse<D>{

    private List<D> data;
    private int pageSize;
    private int totalElements;
    private int pageNo;
    private int totalPage;
    private boolean lastPage;

}
