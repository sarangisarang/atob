package com.atob.atobapp.controler;

import com.atob.atobapp.domain.Location;
import com.atob.atobapp.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/locations")
public class LocationController {

    @Autowired private LocationRepository locationRepository;

    @GetMapping
    public List<Location> getAll() {
        return locationRepository.findAll();
    }

    @GetMapping("/{id}")
    public Location getById(@PathVariable String id) {
        return locationRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Location create(@RequestBody Location location) {
        location.setId(UUID.randomUUID().toString());
        return locationRepository.save(location);
    }

    @PutMapping("/{id}")
    public Location update(@RequestBody Location location, @PathVariable String id) {
        Location existing = locationRepository.findById(id).orElseThrow();
        if (location.getAddress()  != null) existing.setAddress(location.getAddress());
        if (location.getCity()     != null) existing.setCity(location.getCity());
        if (location.getPostcode() != null) existing.setPostcode(location.getPostcode());
        if (location.getPhone()    != null) existing.setPhone(location.getPhone());
        return locationRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        locationRepository.deleteById(id);
    }
}
