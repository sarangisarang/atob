package com.atob.atobapp.service;

import com.atob.atobapp.domain.FileCategory;
import com.atob.atobapp.domain.StoredFile;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.StoredFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * PostgreSQL BYTEA-backed implementation of FileStorageService.
 * To migrate to S3/R2 later, write a new impl and swap the @Primary/@Profile —
 * no controller changes required.
 */
@Service
public class DatabaseFileStorageService implements FileStorageService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private final StoredFileRepository repository;

    public DatabaseFileStorageService(StoredFileRepository repository) {
        this.repository = repository;
    }

    @Override
    public String save(MultipartFile file, FileCategory category) {
        validate(file);

        StoredFile stored = new StoredFile();
        stored.setId(UUID.randomUUID().toString());
        try {
            stored.setData(file.getBytes());
        } catch (IOException e) {
            throw new BadRequestException("Could not read uploaded file");
        }
        stored.setContentType(file.getContentType());
        stored.setOriginalName(file.getOriginalFilename());
        stored.setSizeBytes(file.getSize());
        stored.setCategory(category);

        return repository.save(stored).getId();
    }

    @Override
    public byte[] load(String fileId) {
        return repository.findById(fileId)
                .orElseThrow(() -> new BadRequestException("File not found: " + fileId))
                .getData();
    }

    @Override
    public String contentType(String fileId) {
        return repository.findById(fileId)
                .orElseThrow(() -> new BadRequestException("File not found: " + fileId))
                .getContentType();
    }

    @Override
    public void delete(String fileId) {
        repository.deleteById(fileId);
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Empty file");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException(
                    "File too large: max " + (MAX_SIZE_BYTES / 1024 / 1024) + " MB");
        }
        String type = file.getContentType();
        if (type == null || !ALLOWED_TYPES.contains(type.toLowerCase())) {
            throw new BadRequestException(
                    "Unsupported file type: " + type + " (allowed: " + ALLOWED_TYPES + ")");
        }
    }
}
