package com.atob.atobapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
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
    private boolean hasImage;
    private BigInteger Stock;

    @JsonIgnore
    private byte[] image1;

    // image2-6 kept for future use, not exposed
    @JsonIgnore private byte[] image2;
    @JsonIgnore private byte[] image3;
    @JsonIgnore private byte[] image4;
    @JsonIgnore private byte[] image5;
    @JsonIgnore private byte[] image6;

    // Legacy URL field (still usable as fallback)
    private String imageUrl;

    // Generic storage reference (FileStorageService) — preferred over inline image1
    @Column(name = "image_file_id")
    private String imageFileId;

    @ManyToOne
    @JoinColumn(name = "Carrier_id")
    private Carrier carrier;
}
