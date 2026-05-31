-- ============================================================
-- V2__add_transport_features.sql
-- Phase 0: Vehicle, Cargo, TrackingEvent + Shipping refactor
-- All PKs are VARCHAR(255) — consistent with existing entities.
-- ============================================================

-- ─── shipping: drop old status, add new columns ───────────────────────────────
ALTER TABLE shipping
    DROP COLUMN IF EXISTS carrier_status;

ALTER TABLE shipping
    ADD COLUMN IF NOT EXISTS shipping_status  VARCHAR(40)  NOT NULL DEFAULT 'CREATED',
    ADD COLUMN IF NOT EXISTS transport_type   VARCHAR(30)  NOT NULL DEFAULT 'LIGHT',
    ADD COLUMN IF NOT EXISTS notes            VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMP;

-- ─── vehicle ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle (
    id              VARCHAR(255)  PRIMARY KEY,
    carrier_id      VARCHAR(255)  REFERENCES carrier(id),
    plate_number    VARCHAR(50)   NOT NULL,
    vehicle_type    VARCHAR(30)   NOT NULL,
    max_weight_kg   DOUBLE PRECISION,
    max_volume_m3   DOUBLE PRECISION,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── shipping: vehicle FK ─────────────────────────────────────────────────────
ALTER TABLE shipping
    ADD COLUMN IF NOT EXISTS vehicle_id VARCHAR(255);

ALTER TABLE shipping
    DROP CONSTRAINT IF EXISTS fk_shipping_vehicle;

ALTER TABLE shipping
    ADD CONSTRAINT fk_shipping_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle(id);

-- ─── cargo ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cargo (
    id              VARCHAR(255)  PRIMARY KEY,
    shipping_id     VARCHAR(255)  NOT NULL REFERENCES shipping(id),
    name            VARCHAR(150)  NOT NULL,
    description     VARCHAR(1000),
    cargo_type      VARCHAR(40)   NOT NULL DEFAULT 'GENERAL_GOODS',
    weight_kg       DOUBLE PRECISION,
    length_cm       DOUBLE PRECISION,
    width_cm        DOUBLE PRECISION,
    height_cm       DOUBLE PRECISION,
    vin             VARCHAR(80),
    plate_number    VARCHAR(50),
    quantity        INTEGER       DEFAULT 1
);

-- ─── tracking_event ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tracking_event (
    id              VARCHAR(255)  PRIMARY KEY,
    shipping_id     VARCHAR(255)  NOT NULL REFERENCES shipping(id),
    carrier_id      VARCHAR(255)  REFERENCES carrier(id),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    speed           DOUBLE PRECISION,
    recorded_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shipping_status
    ON shipping(shipping_status);

CREATE INDEX IF NOT EXISTS idx_shipping_transport_type
    ON shipping(transport_type);

CREATE INDEX IF NOT EXISTS idx_shipping_vehicle_id
    ON shipping(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_cargo_shipping_id
    ON cargo(shipping_id);

CREATE INDEX IF NOT EXISTS idx_tracking_shipping_recorded
    ON tracking_event(shipping_id, recorded_at);
