package com.atob.atobapp.config;
import com.atob.atobapp.security.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;


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
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/register/customers/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/show/**")).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(new DaoAuthenticationProvider()) // spring not calling authentication provider
                .userDetailsService(myUserDetailsService)
                .build();
    }
}
