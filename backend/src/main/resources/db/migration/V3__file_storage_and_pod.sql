-- ============================================================
-- V3__file_storage_and_pod.sql
-- Generic file storage abstraction + Proof of Delivery foundation
-- ============================================================

-- ─── stored_file: generic binary storage ─────────────────────────────────────
-- Backing store for FileStorageService. BYTEA today, S3/R2 url later.
CREATE TABLE IF NOT EXISTS stored_file (
    id             VARCHAR(255) PRIMARY KEY,
    data           BYTEA         NOT NULL,
    content_type   VARCHAR(100)  NOT NULL,
    original_name  VARCHAR(255),
    size_bytes     BIGINT,
    category       VARCHAR(50),
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── product: reference stored_file instead of inline image1 ─────────────────
-- image1..image6 columns kept for backward compatibility with old data.
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS image_file_id VARCHAR(255) REFERENCES stored_file(id);

-- ─── delivery_proof: Proof of Delivery ───────────────────────────────────────
-- One proof per shipping (UNIQUE). photo_file_id → stored_file.
CREATE TABLE IF NOT EXISTS delivery_proof (
    id             VARCHAR(255) PRIMARY KEY,
    shipping_id    VARCHAR(255) NOT NULL UNIQUE REFERENCES shipping(id),
    receiver_name  VARCHAR(255),
    photo_file_id  VARCHAR(255) REFERENCES stored_file(id),
    notes          TEXT,
    delivered_at   TIMESTAMP,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_proof_shipping ON delivery_proof(shipping_id);
CREATE INDEX IF NOT EXISTS idx_stored_file_category    ON stored_file(category);
