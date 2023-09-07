package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import java.math.BigInteger;

@Entity
@Setter
@Getter
public class Product {
    @Id
    private String id;
    private String productName;
    private String productDesc;
    private byte[] image1;
    private byte[] image2;
    private byte[] image3;
    private byte[] image4;
    private byte[] image5;
    private byte[] image6;
    private BigInteger Stock;

    @ManyToOne
    @JoinColumn(name="Carrier_id")
    private Carrier carrier;
}
