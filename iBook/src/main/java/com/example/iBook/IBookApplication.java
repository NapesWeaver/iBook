package com.example.iBook;

import javax.sql.DataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@SpringBootApplication
public class IBookApplication {

	public static void main(String[] args) {
		SpringApplication.run(IBookApplication.class, args);
	}

	@Bean
	public WebSecurityConfigurerAdapter webSecurityConfig(DataSource dataSource) {
		return new WebSecurityConfigurerAdapter() {
			@Override
			protected void configure(HttpSecurity http) throws Exception {
				http.csrf().disable().authorizeRequests().anyRequest().authenticated().and().formLogin();
			}

			@Override
			protected void configure(AuthenticationManagerBuilder builder) throws Exception {
				builder.jdbcAuthentication().passwordEncoder(new BCryptPasswordEncoder()).dataSource(dataSource);
			}
			
		};
	}

}
