package com.atob.atobapp.service;
import com.atob.atobapp.domain.Shipping;
import com.atob.atobapp.repository.ShippmentRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Getter
@Setter
public class ShippingService {
    @Autowired
    private ShippmentRepository shippmentRepository;


    public Shipping updateShipping(@RequestBody Shipping shipping, String id) {
        Shipping shippingUpdate = shippmentRepository.findById(id).orElseThrow();
        if (shippingUpdate.getStatusService() != StatusService.processing){
            System.out.println("Not allowed to update Shipping");
        }else{
            shippingUpdate.setDeliveryEndAt(shipping.getDeliveryEndAt());
            shippingUpdate.setTrackingLangitude(shipping.getTrackingLangitude());
            shippingUpdate.setTrackingLatitude(shipping.getTrackingLatitude());
        }
        return shippmentRepository.save(shippingUpdate);
    }
}

    //ToDo: creat Shipping, postMapping
//Todo: Start shipping processing, putMapping
// Todo: Start Shipping,putMapping
//Todo: Tracking,putMapping,putMapping
// Todo: Shipping Delivered, putMapping

