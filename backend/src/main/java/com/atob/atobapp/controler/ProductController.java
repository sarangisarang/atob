package com.atob.atobapp.controler;

import com.atob.atobapp.domain.FileCategory;
import com.atob.atobapp.domain.Product;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.ProductRepository;
import com.atob.atobapp.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigInteger;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private FileStorageService fileStorageService;

    @GetMapping
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable String id) {
        return productRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        product.setId(UUID.randomUUID().toString());
        if (product.getStock() == null) product.setStock(BigInteger.ZERO);
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public Product update(@RequestBody Product product, @PathVariable String id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Product not found"));
        if (product.getProductName() != null) existing.setProductName(product.getProductName());
        if (product.getProductDesc() != null) existing.setProductDesc(product.getProductDesc());
        if (product.getImageUrl()    != null) existing.setImageUrl(product.getImageUrl());
        if (product.getStock() != null) {
            if (product.getStock().compareTo(BigInteger.ZERO) < 0)
                throw new BadRequestException("Stock cannot be negative");
            existing.setStock(product.getStock());
        }
        return productRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        productRepository.deleteById(id);
    }

    // ─── Image upload (admin only) ───────────────────────────────────────────
    // Controller does NOT touch storage internals — delegates to FileStorageService.

    @PostMapping("/{id}/image")
    public Product uploadImage(@PathVariable String id,
                               @RequestParam("file") MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Product not found"));

        String oldFileId = product.getImageFileId();

        // Save new file FIRST (validation happens here), then repoint product
        String newFileId = fileStorageService.save(file, FileCategory.PRODUCT_IMAGE);
        product.setImageFileId(newFileId);
        product.setHasImage(true);
        Product saved = productRepository.save(product);

        // Only now is it safe to delete the old file (no FK reference left)
        if (oldFileId != null) {
            fileStorageService.delete(oldFileId);
        }
        return saved;
    }

    // ─── Image serve ─────────────────────────────────────────────────────────

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null || product.getImageFileId() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] bytes = fileStorageService.load(product.getImageFileId());
        String type  = fileStorageService.contentType(product.getImageFileId());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(type))
                .header("Cache-Control", "public, max-age=86400")
                .body(bytes);
    }
}
