package com.example.e_commerce.Helper;

import com.example.e_commerce.mapper.Mapper;
import com.example.e_commerce.mapper.ProductMapper;
import com.example.e_commerce.util.PageableResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

public class Helper {

    public static <E, D> PageableResponse<D> getPageableResponse(Page<E> page, Mapper<E, D> mapper) {

        List<D> collect = page.getContent().stream().map(mapper::toDto).collect(Collectors.toList());
        PageableResponse<D> response = new PageableResponse<>();
        response.setData(collect);
        response.setPageSize(page.getSize());
        response.setTotalElements((int) page.getTotalElements());
        response.setPageNo(page.getNumber());
        response.setTotalPage(page.getTotalPages());
        response.setLastPage(page.isLast());
        return response;
    }
}
