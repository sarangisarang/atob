package com.atob.atobapp.service;

import com.atob.atobapp.domain.FileCategory;
import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction. Controllers and business logic depend ONLY on this
 * interface — never on the concrete storage mechanism.
 *
 * Current implementation: DatabaseFileStorageService (PostgreSQL BYTEA).
 * Future implementations: S3FileStorageService, CloudflareR2FileStorageService.
 * Swapping storage backends must not require any controller changes.
 */
public interface FileStorageService {

    /** Validates + stores the file, returns its generated id. */
    String save(MultipartFile file, FileCategory category);

    /** Raw bytes for serving. */
    byte[] load(String fileId);

    /** MIME type for the Content-Type response header. */
    String contentType(String fileId);

    /** Removes the file. No-op if it does not exist. */
    void delete(String fileId);
}
