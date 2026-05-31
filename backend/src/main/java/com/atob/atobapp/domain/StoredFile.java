package com.atob.atobapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Generic binary file storage.
 * Current backing store: PostgreSQL BYTEA (DatabaseFileStorageService).
 * Future: S3 / Cloudflare R2 — only the FileStorageService impl changes,
 * this entity stays as a metadata record (data column becomes nullable + url).
 */
@Entity
@Table(name = "stored_file")
@Getter
@Setter
public class StoredFile {

    @Id
    private String id;

    @JsonIgnore                       // never serialize raw bytes in JSON
    @Column(nullable = false)
    private byte[] data;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private FileCategory category;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
