package com.example.iBook.repo;

import org.springframework.data.repository.PagingAndSortingRepository;

import com.example.iBook.pojo.User;

public interface UserRepository extends PagingAndSortingRepository<User, Integer> {
	public User findFirstByName(String name);
}
