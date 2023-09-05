package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Carrier {
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

    @ManyToOne
    @JoinColumn(name="TransportOrder_id")
    private TransportOrder transportOrder;
}
