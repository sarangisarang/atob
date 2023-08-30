package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class Customer {
    @Id
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String Password;
    private String Address;
    private Integer Postcode;
    private String City;
    private Integer Phone;
}
