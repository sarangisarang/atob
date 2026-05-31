package com.atob.atobapp.config;

import com.atob.atobapp.security.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class CustomWebSecurityConfiguration {

    @Autowired
    public MyUserDetailsService myUserDetailsService;

    // Encodes new registration passwords as {bcrypt}$2a$... — matches the default
    // delegating encoder the DaoAuthenticationProvider uses to verify seed + new users.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/register/signUpCustomer", "/register/signUpDriver").permitAll()

                        // Admin-only: orders dashboard + legacy shipping
                        .requestMatchers("/show/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/shipping/create").hasRole("ADMIN")
                        .requestMatchers("/shipping/*/assign/**", "/shipping/*/vehicle/**", "/shipping/*/cancel").hasRole("ADMIN")

                        // Vehicles: read = admin + driver; write = admin only
                        .requestMatchers(HttpMethod.GET,    "/api/vehicles/**").hasAnyRole("ADMIN", "DRIVER")
                        .requestMatchers(HttpMethod.POST,   "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("ADMIN")

                        // /api/shippings: all authenticated roles can access list/get
                        // Assignment + create = admin only
                        .requestMatchers(HttpMethod.POST, "/api/shippings").hasRole("ADMIN")
                        // Marketplace: drivers browse + claim unassigned orders
                        .requestMatchers(HttpMethod.GET,   "/api/shippings/available").hasAnyRole("DRIVER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/shippings/*/accept").hasAnyRole("DRIVER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/shippings/*/assign-driver/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/shippings/*/assign-vehicle/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/shippings/*/cancel").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/shippings/*/fail").hasRole("ADMIN")

                        // Cargo write = admin only
                        .requestMatchers(HttpMethod.POST,   "/api/shippings/*/cargo").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/shippings/cargo/**").hasRole("ADMIN")

                        // Customer creates own order (customer resolved from token)
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasAnyRole("CUSTOMER", "ADMIN")

                        // Everything else: authenticated
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .authenticationProvider(authenticationProvider())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(myUserDetailsService);
        return provider;
    }
}
