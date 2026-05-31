package com.atob.atobapp.service;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.dto.CustomerOrderRequestDTO;
import com.atob.atobapp.dto.ShippingResponseDTO;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Customer-initiated order creation. One transaction builds the whole chain so a
 * customer's new order is immediately visible in their My Orders (/api/shippings):
 *   Location(pickup) + Location(delivery) + TransportOrder(Pending)
 *   + Shipping(CREATED) + Cargo
 * Admin later assigns driver/vehicle (CREATED → ASSIGNED).
 */
@Service
public class CustomerOrderService {

    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final TransportOrderRepository orderRepository;
    private final ShippmentRepository shippingRepository;
    private final CargoRepository cargoRepository;

    public CustomerOrderService(CustomerRepository customerRepository,
                                LocationRepository locationRepository,
                                TransportOrderRepository orderRepository,
                                ShippmentRepository shippingRepository,
                                CargoRepository cargoRepository) {
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.orderRepository    = orderRepository;
        this.shippingRepository = shippingRepository;
        this.cargoRepository    = cargoRepository;
    }

    @Transactional
    public ShippingResponseDTO create(String customerEmail, CustomerOrderRequestDTO r) {
        Customer customer = customerRepository.findAllByEmail(customerEmail);
        if (customer == null) {
            throw new BadRequestException("Customer profile not found for " + customerEmail);
        }

        // ── validation ──
        require(r.pickupCity(),   "Pickup city is required");
        require(r.deliveryCity(), "Delivery city is required");
        require(r.cargoName(),    "Cargo name is required");
        TransportType transportType = parseTransport(r.transportType());
        CargoType cargoType = parseCargo(r.cargoType());
        if (r.weightKg() != null && r.weightKg() < 0) throw new BadRequestException("Weight cannot be negative");
        if (r.quantity() != null && r.quantity() < 1) throw new BadRequestException("Quantity must be at least 1");

        // ── locations ──
        Location from = saveLocation(r.pickupAddress(),   r.pickupPostcode(),   r.pickupCity(),   r.pickupPhone());
        Location to   = saveLocation(r.deliveryAddress(), r.deliveryPostcode(), r.deliveryCity(), r.deliveryPhone());

        // ── order ──
        LocalDate shipDate = parseDate(r.shippingDate());
        TransportOrder order = new TransportOrder();
        order.setId(UUID.randomUUID().toString());
        order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        order.setOrderDate(LocalDate.now());
        order.setShippingDate(shipDate);
        order.setShippingFrom(from);
        order.setShippingTo(to);
        order.setCustomer(customer);
        order.setOrderStatus(OrderStatus.Pending);
        orderRepository.save(order);

        // ── shipping (CREATED) ──
        Shipping shipping = new Shipping();
        shipping.setId(UUID.randomUUID().toString());
        shipping.setTransportType(transportType);
        shipping.setShippingStatus(ShippingStatus.CREATED);
        shipping.setOrder(order);
        shipping.setDeliveryStartAt(shipDate);
        shipping.setNotes(r.notes());
        shippingRepository.save(shipping);

        // ── cargo ──
        Cargo cargo = new Cargo();
        cargo.setId(UUID.randomUUID().toString());
        cargo.setShipping(shipping);
        cargo.setName(r.cargoName());
        cargo.setDescription(r.cargoDescription());
        cargo.setCargoType(cargoType);
        cargo.setWeightKg(r.weightKg());
        cargo.setQuantity(r.quantity() != null ? r.quantity() : 1);
        cargoRepository.save(cargo);

        return ShippingResponseDTO.from(shipping);
    }

    // ── helpers ──

    private Location saveLocation(String address, String postcode, String city, String phone) {
        Location loc = new Location();
        loc.setId(UUID.randomUUID().toString());
        loc.setAddress(address);
        loc.setCity(city);
        loc.setPostcode(toIntOrNull(postcode));
        loc.setPhone(toIntOrNull(phone));
        return locationRepository.save(loc);
    }

    private void require(String v, String msg) {
        if (v == null || v.isBlank()) throw new BadRequestException(msg);
    }

    private TransportType parseTransport(String v) {
        if (v == null || v.isBlank()) return TransportType.LIGHT;
        try { return TransportType.valueOf(v.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Unknown transport type: " + v); }
    }

    private CargoType parseCargo(String v) {
        if (v == null || v.isBlank()) return CargoType.GENERAL_GOODS;
        try { return CargoType.valueOf(v.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Unknown cargo type: " + v); }
    }

    private LocalDate parseDate(String v) {
        if (v == null || v.isBlank()) return null;
        try { return LocalDate.parse(v.trim()); }
        catch (Exception e) { throw new BadRequestException("Invalid date (use yyyy-MM-dd): " + v); }
    }

    private Integer toIntOrNull(String v) {
        if (v == null) return null;
        String digits = v.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return null;
        try { return Integer.parseInt(digits); } catch (NumberFormatException e) { return null; }
    }
}
