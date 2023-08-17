package com.atob.atobapp.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class TruckDriver {
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return Password;
    }

    public void setPassword(String password) {
        Password = password;
    }

    public String getAddress() {
        return Address;
    }

    public void setAddress(String address) {
        Address = address;
    }

    public Integer getPostcode() {
        return Postcode;
    }

    public void setPostcode(Integer postcode) {
        Postcode = postcode;
    }

    public String getCity() {
        return City;
    }

    public void setCity(String city) {
        City = city;
    }

    public Integer getPhone() {
        return Phone;
    }

    public void setPhone(Integer phone) {
        Phone = phone;
    }
}
