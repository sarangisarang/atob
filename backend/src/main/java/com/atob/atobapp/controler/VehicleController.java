package com.atob.atobapp.controler;

import com.atob.atobapp.dto.VehicleResponseDTO;
import com.atob.atobapp.domain.Vehicle;
import com.atob.atobapp.service.VehicleService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<VehicleResponseDTO> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        size = Math.min(size, 200);
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return vehicleService.findAllActive(pageable).stream()
                .map(VehicleResponseDTO::from)
                .toList();
    }

    @GetMapping("/{id}")
    public VehicleResponseDTO getById(@PathVariable String id) {
        return VehicleResponseDTO.from(vehicleService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponseDTO create(@RequestBody Vehicle vehicle) {
        return VehicleResponseDTO.from(vehicleService.create(vehicle));
    }

    @PutMapping("/{id}")
    public VehicleResponseDTO update(@PathVariable String id, @RequestBody Vehicle vehicle) {
        return VehicleResponseDTO.from(vehicleService.update(id, vehicle));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable String id) {
        vehicleService.deactivate(id);
    }
}
