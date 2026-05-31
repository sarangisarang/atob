package com.atob.atobapp.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Customer {
    @Id
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    // Accepted from registration requests, never serialized back in responses.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String Address;
    private String Postcode;
    private String City;
    private String Phone;
}
