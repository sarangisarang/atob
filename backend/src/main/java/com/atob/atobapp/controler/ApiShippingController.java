package com.atob.atobapp.controler;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.dto.*;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import com.atob.atobapp.service.CargoService;
import com.atob.atobapp.service.DeliveryProofService;
import com.atob.atobapp.service.ShippingService;
import com.atob.atobapp.service.TrackingRateLimiter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/shippings")
public class ApiShippingController {

    private final ShippmentRepository shippingRepository;
    private final ShippingService shippingService;
    private final CargoService cargoService;
    private final DeliveryProofService deliveryProofService;
    private final UserRepository userRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final TrackingRateLimiter trackingRateLimiter;

    public ApiShippingController(ShippmentRepository shippingRepository,
                                 ShippingService shippingService,
                                 CargoService cargoService,
                                 DeliveryProofService deliveryProofService,
                                 UserRepository userRepository,
                                 TrackingEventRepository trackingEventRepository,
                                 TrackingRateLimiter trackingRateLimiter) {
        this.shippingRepository      = shippingRepository;
        this.shippingService         = shippingService;
        this.cargoService            = cargoService;
        this.deliveryProofService    = deliveryProofService;
        this.userRepository          = userRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.trackingRateLimiter     = trackingRateLimiter;
    }

    // ─── List (role-filtered, paginated) ─────────────────────────────────────

    @GetMapping
    public List<ShippingResponseDTO> list(
            Principal principal,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        size = Math.min(size, 100); // max 100 per page
        var pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());

        String role = getRole(principal);
        List<Shipping> shippings = switch (role) {
            case "ADMIN"    -> shippingRepository.findAll(pageable).getContent();
            case "DRIVER"   -> shippingRepository.findAllByCarrierEmail(principal.getName(), pageable);
            case "CUSTOMER" -> shippingRepository.findAllByOrderCustomerEmail(principal.getName(), pageable);
            default         -> List.of();
        };
        return shippings.stream().map(ShippingResponseDTO::from).toList();
    }

    // ─── Marketplace: available (unclaimed) orders for drivers ────────────────

    @GetMapping("/available")
    public List<ShippingResponseDTO> available(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        size = Math.min(size, 100);
        var pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return shippingRepository
                .findAllByCarrierIsNullAndShippingStatus(ShippingStatus.CREATED, pageable)
                .stream().map(ShippingResponseDTO::from).toList();
    }

    // Driver claims an available order for themselves.
    @PatchMapping("/{id}/accept")
    public ShippingResponseDTO accept(@PathVariable String id, Principal principal) {
        return ShippingResponseDTO.from(shippingService.acceptShipping(id, principal.getName()));
    }

    // ─── Single ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ShippingResponseDTO get(@PathVariable String id, Principal principal) {
        Shipping shipping = findAndCheckAccess(id, principal);
        return ShippingResponseDTO.from(shipping);
    }

    // ─── Create (admin only — enforced in security config) ───────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShippingResponseDTO create(@RequestBody Shipping shipping) {
        return ShippingResponseDTO.from(shippingService.createShipping(shipping));
    }

    // ─── Assignment ───────────────────────────────────────────────────────────

    @PatchMapping("/{id}/assign-driver/{driverId}")
    public ShippingResponseDTO assignDriver(@PathVariable String id,
                                            @PathVariable String driverId) {
        return ShippingResponseDTO.from(shippingService.assignDriver(id, driverId));
    }

    @PatchMapping("/{id}/assign-vehicle/{vehicleId}")
    public ShippingResponseDTO assignVehicle(@PathVariable String id,
                                             @PathVariable String vehicleId) {
        return ShippingResponseDTO.from(shippingService.assignVehicle(id, vehicleId));
    }

    // ─── Status transitions (driver-only for pickup/transit/deliver) ──────────

    @PatchMapping("/{id}/start-pickup")
    public ShippingResponseDTO startPickup(@PathVariable String id, Principal principal) {
        assertDriverOwns(id, principal);
        return ShippingResponseDTO.from(shippingService.startPickup(id));
    }

    @PatchMapping("/{id}/picked-up")
    public ShippingResponseDTO pickedUp(@PathVariable String id, Principal principal) {
        assertDriverOwns(id, principal);
        return ShippingResponseDTO.from(shippingService.pickUp(id));
    }

    @PatchMapping("/{id}/in-transit")
    public ShippingResponseDTO inTransit(@PathVariable String id, Principal principal) {
        assertDriverOwns(id, principal);
        return ShippingResponseDTO.from(shippingService.startTransit(id));
    }

    @PatchMapping("/{id}/deliver")
    public ShippingResponseDTO deliver(@PathVariable String id, Principal principal) {
        assertDriverOwns(id, principal);
        return ShippingResponseDTO.from(shippingService.deliver(id));
    }

    @PatchMapping("/{id}/cancel")
    public ShippingResponseDTO cancel(@PathVariable String id) {
        return ShippingResponseDTO.from(shippingService.cancel(id));
    }

    @PatchMapping("/{id}/fail")
    public ShippingResponseDTO fail(@PathVariable String id) {
        return ShippingResponseDTO.from(shippingService.markFailed(id));
    }

    // ─── GPS tracking ─────────────────────────────────────────────────────────

    @PostMapping("/{id}/tracking")
    public ShippingResponseDTO updateTracking(@PathVariable String id,
                                              @RequestBody TrackingRequest req,
                                              Principal principal) {
        assertDriverOwns(id, principal);
        if (!trackingRateLimiter.tryConsume(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "GPS update rate limit exceeded — max 1 per 10 seconds");
        }
        return ShippingResponseDTO.from(
                shippingService.updateCoordinates(id,
                        BigDecimal.valueOf(req.latitude()),
                        BigDecimal.valueOf(req.longitude())));
    }

    @GetMapping("/{id}/tracking")
    public List<TrackingEventResponseDTO> getTracking(@PathVariable String id,
                                                       Principal principal) {
        findAndCheckAccess(id, principal);
        return trackingEventRepository
                .findAllByShippingIdOrderByRecordedAtDesc(id)
                .stream()
                .map(TrackingEventResponseDTO::from)
                .toList();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String getRole(Principal principal) {
        return userRepository.findUserByUsername(principal.getName())
                .map(u -> u.getRoles().stream()
                        .map(r -> r.getRoleName().replace("ROLE_", ""))
                        .findFirst().orElse("UNKNOWN"))
                .orElse("UNKNOWN");
    }

    private Shipping findAndCheckAccess(String id, Principal principal) {
        Shipping shipping = shippingRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Shipping not found: " + id));
        String role = getRole(principal);
        return switch (role) {
            case "ADMIN"    -> shipping;
            case "DRIVER"   -> {
                if (shipping.getCarrier() == null
                        || !shipping.getCarrier().getEmail().equals(principal.getName())) {
                    throw new BadRequestException("Access denied");
                }
                yield shipping;
            }
            case "CUSTOMER" -> {
                if (shipping.getOrder() == null
                        || shipping.getOrder().getCustomer() == null
                        || !shipping.getOrder().getCustomer().getEmail().equals(principal.getName())) {
                    throw new BadRequestException("Access denied");
                }
                yield shipping;
            }
            default -> throw new BadRequestException("Access denied");
        };
    }

    private void assertDriverOwns(String shippingId, Principal principal) {
        String role = getRole(principal);
        if ("ADMIN".equals(role)) return;
        if (!"DRIVER".equals(role)) throw new BadRequestException("Only drivers can update shipping status");
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new BadRequestException("Shipping not found: " + shippingId));
        if (shipping.getCarrier() == null
                || !shipping.getCarrier().getEmail().equals(principal.getName())) {
            throw new BadRequestException("You are not assigned to this shipment");
        }
    }

    public record TrackingRequest(double latitude, double longitude, Double speed) {}

    // ─── By-order lookup (for OrderDetailScreen) ─────────────────────────────

    @GetMapping("/by-order/{orderId}")
    public ShippingResponseDTO getByOrder(@PathVariable String orderId, Principal principal) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BadRequestException("No shipping for order: " + orderId));
        findAndCheckAccess(shipping.getId(), principal);
        return ShippingResponseDTO.from(shipping);
    }

    // ─── Cargo (nested resource) ──────────────────────────────────────────────

    @GetMapping("/{id}/cargo")
    public List<CargoResponseDTO> listCargo(@PathVariable String id, Principal principal) {
        findAndCheckAccess(id, principal);
        return cargoService.findByShipping(id);
    }

    @PostMapping("/{id}/cargo")
    @ResponseStatus(HttpStatus.CREATED)
    public CargoResponseDTO addCargo(@PathVariable String id,
                                     @RequestBody CargoRequestDTO req) {
        return cargoService.add(id, req);
    }

    @DeleteMapping("/cargo/{cargoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCargo(@PathVariable String cargoId) {
        cargoService.remove(cargoId);
    }

    // ─── Proof of Delivery ────────────────────────────────────────────────────

    // Driver submits proof for own delivered shipment (photo optional)
    @PostMapping(value = "/{id}/proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryProofResponseDTO submitProof(
            @PathVariable String id,
            @RequestParam("receiverName") String receiverName,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            Principal principal) {
        assertDriverOwns(id, principal);
        return DeliveryProofResponseDTO.from(
                deliveryProofService.submit(id, receiverName, notes, photo));
    }

    // Anyone with access to the shipment can read the proof
    @GetMapping("/{id}/proof")
    public DeliveryProofResponseDTO getProof(@PathVariable String id, Principal principal) {
        findAndCheckAccess(id, principal);
        return DeliveryProofResponseDTO.from(deliveryProofService.getByShipping(id));
    }

    // Serve the proof photo
    @GetMapping("/{id}/proof/photo")
    public ResponseEntity<byte[]> getProofPhoto(@PathVariable String id, Principal principal) {
        findAndCheckAccess(id, principal);
        byte[] bytes = deliveryProofService.loadPhoto(id);
        String type  = deliveryProofService.photoContentType(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(type))
                .header("Cache-Control", "public, max-age=86400")
                .body(bytes);
    }
}
