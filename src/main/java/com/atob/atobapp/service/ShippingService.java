package com.atob.atobapp.service;
import com.atob.atobapp.domain.Shipping;
import com.atob.atobapp.repository.ShippmentRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import java.math.BigDecimal;
import java.util.UUID;

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
            shippingUpdate.setDeliveryStartAt(shippingUpdate.getDeliveryStartAt());
            shippingUpdate.setTrackingLongitude(shipping.getTrackingLongitude());
            shippingUpdate.setTrackingLatitude(shipping.getTrackingLatitude());
        }
        return shippmentRepository.save(shippingUpdate);
    }

    public Shipping creatShipping(Shipping shipping) {
        shipping.setId(UUID.randomUUID().toString());
        return shippmentRepository.save(shipping);
    }

    public Shipping updateCoordinate(String shipping_id, BigDecimal attitude, BigDecimal longitude) {
        Shipping shipping = shippmentRepository.findById(shipping_id).orElseThrow();
        shipping.setTrackingLongitude(longitude);
        shipping.setTrackingLatitude(attitude);
        return shippmentRepository.save(shipping);
    }
}

//ToDo: creat Shipping, postMapping done
//Todo: Start shipping processing, putMapping done
//Todo: Tracking,putMapping,putMapping done

// Todo: Start Shipping,putMapping
// Todo: Shipping Delivered, putMapping

