package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Location {
    @Id
    private String id;
    private String Address;
    private Integer Postcode;
    private String City;
    private Integer Phone;
}
