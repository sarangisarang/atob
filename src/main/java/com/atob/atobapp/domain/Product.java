package com.atob.atobapp.domain;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.math.BigInteger;
@Entity
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


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDesc() {
        return productDesc;
    }

    public void setProductDesc(String productDesc) {
        this.productDesc = productDesc;
    }

    public byte[] getImage1() {
        return image1;
    }

    public void setImage1(byte[] image1) {
        this.image1 = image1;
    }

    public byte[] getImage2() {
        return image2;
    }

    public void setImage2(byte[] image2) {
        this.image2 = image2;
    }

    public byte[] getImage3() {
        return image3;
    }

    public void setImage3(byte[] image3) {
        this.image3 = image3;
    }

    public byte[] getImage4() {
        return image4;
    }

    public void setImage4(byte[] image4) {
        this.image4 = image4;
    }

    public byte[] getImage5() {
        return image5;
    }

    public void setImage5(byte[] image5) {
        this.image5 = image5;
    }

    public byte[] getImage6() {
        return image6;
    }

    public void setImage6(byte[] image6) {
        this.image6 = image6;
    }

    public BigInteger getStock() {
        return Stock;
    }

    public void setStock(BigInteger stock) {
        Stock = stock;
    }


}
