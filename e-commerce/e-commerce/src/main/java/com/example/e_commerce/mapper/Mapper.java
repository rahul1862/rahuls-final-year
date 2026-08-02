package com.example.e_commerce.mapper;

public interface Mapper<E,D> {

        D toDto(E entity);

        E toEntity(D dto);

}
