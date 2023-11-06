package com.atob.atobapp.config;

import com.atob.atobapp.security.BasicAuthFilter;
import com.atob.atobapp.security.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class CustomWebSecurityConfiguration {

    @Autowired
    public MyUserDetailsService myUserDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/register/customers/**").permitAll()
                        .requestMatchers("/show/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(new DaoAuthenticationProvider())
                .userDetailsService(myUserDetailsService)
                .addFilterAfter(new BasicAuthFilter(), BasicAuthenticationFilter.class)
                .build();

    }
}
