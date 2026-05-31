-- ============================================================
-- V1__init_schema.sql
-- ATOB TrackTransporter — სრული DB schema
-- Entity → table mapping: SpringPhysicalNamingStrategy (camelCase → snake_case)
-- ============================================================

-- ─── customer ────────────────────────────────────────────────────────────────
-- Entity: Customer.java
-- String fields: phone, postcode (NOT Integer — supports +49, SW1A 2AA etc.)
CREATE TABLE customer (
    id            VARCHAR(255) PRIMARY KEY,
    email         VARCHAR(255),
    first_name    VARCHAR(255),
    last_name     VARCHAR(255),
    password      VARCHAR(255),
    address       VARCHAR(255),
    postcode      VARCHAR(255),
    city          VARCHAR(255),
    phone         VARCHAR(255)
);

-- ─── carrier ─────────────────────────────────────────────────────────────────
-- Entity: Carrier.java
-- String fields: phone, postcode (same reason as customer)
CREATE TABLE carrier (
    id            VARCHAR(255) PRIMARY KEY,
    email         VARCHAR(255),
    first_name    VARCHAR(255),
    last_name     VARCHAR(255),
    password      VARCHAR(255),
    address       VARCHAR(255),
    postcode      VARCHAR(255),
    city          VARCHAR(255),
    phone         VARCHAR(255)
);

-- ─── location ────────────────────────────────────────────────────────────────
-- Entity: Location.java — Postcode and Phone remain Integer (entity unchanged)
CREATE TABLE location (
    id            VARCHAR(255) PRIMARY KEY,
    address       VARCHAR(255),
    postcode      INTEGER,
    city          VARCHAR(255),
    phone         INTEGER
);

-- ─── product ─────────────────────────────────────────────────────────────────
-- Entity: Product.java
-- Stock: BigInteger → NUMERIC
-- image1-6: byte[] → BYTEA
-- carrier_id: @JoinColumn(name = "Carrier_id") → PostgreSQL lowercases to carrier_id
CREATE TABLE product (
    id            VARCHAR(255) PRIMARY KEY,
    product_name  VARCHAR(255),
    product_desc  VARCHAR(255),
    stock         NUMERIC,
    has_image     BOOLEAN,
    image1        BYTEA,
    image2        BYTEA,
    image3        BYTEA,
    image4        BYTEA,
    image5        BYTEA,
    image6        BYTEA,
    image_url     VARCHAR(255),
    carrier_id    VARCHAR(255) REFERENCES carrier(id)
);

-- ─── transport_order ─────────────────────────────────────────────────────────
-- Entity: TransportOrder.java
-- @JoinColumn names (explicit): shippingfrom_id, shippingto_id, customer_id, product_id
-- order_status: OrderStatus enum → VARCHAR
CREATE TABLE transport_order (
    id               VARCHAR(255) PRIMARY KEY,
    order_id         VARCHAR(255),
    order_no         INTEGER,
    order_date       DATE,
    shipping_date    DATE,
    delivered_date   DATE,
    order_status     VARCHAR(50),
    shippingfrom_id  VARCHAR(255) REFERENCES location(id),
    shippingto_id    VARCHAR(255) REFERENCES location(id),
    customer_id      VARCHAR(255) REFERENCES customer(id),
    product_id       VARCHAR(255) REFERENCES product(id)
);

-- ─── shipping ────────────────────────────────────────────────────────────────
-- Entity: Shipping.java
-- carrier_id: @OneToOne @JoinColumn(name = "carrier_id") — no UNIQUE (carriers can have historic shippings)
-- order_id:   @OneToOne @JoinColumn(name = "order_id")   — UNIQUE (one order → one shipping)
-- tracking coords: @Column(columnDefinition = "numeric(50,20)") → NUMERIC(50,20)
-- carrier_status: CarrierStatus enum → VARCHAR
CREATE TABLE shipping (
    id                   VARCHAR(255) PRIMARY KEY,
    delivery_start_at    DATE,
    delivery_end_at      DATE,
    tracking_longitude   NUMERIC(50, 20),
    tracking_latitude    NUMERIC(50, 20),
    carrier_status       VARCHAR(50),
    carrier_id           VARCHAR(255) REFERENCES carrier(id),
    order_id             VARCHAR(255) UNIQUE REFERENCES transport_order(id)
);

-- ─── service_user ────────────────────────────────────────────────────────────
-- Entity: ServiceUser.java — Spring Security users
-- password stored as {noop}plaintext or {bcrypt}hash
CREATE TABLE service_user (
    id        VARCHAR(255) PRIMARY KEY,
    username  VARCHAR(255) UNIQUE NOT NULL,
    password  VARCHAR(255) NOT NULL
);

-- ─── user_role ───────────────────────────────────────────────────────────────
-- Entity: UserRole.java
CREATE TABLE user_role (
    id         VARCHAR(255) PRIMARY KEY,
    role_name  VARCHAR(100),
    user_id    VARCHAR(255) REFERENCES service_user(id)
);

-- ─── chat_conversation ───────────────────────────────────────────────────────
-- Entity: ChatConversation.java
-- shipping_id UNIQUE: ერთ გზავნილზე მხოლოდ ერთი საუბარი (business rule)
-- customer_id, driver_id: soft FK (no ON DELETE CASCADE — entity deletion is app-managed)
CREATE TABLE chat_conversation (
    id           VARCHAR(255) PRIMARY KEY,
    customer_id  VARCHAR(255),
    driver_id    VARCHAR(255),
    shipping_id  VARCHAR(255) UNIQUE,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);

-- ─── message ─────────────────────────────────────────────────────────────────
-- Entity: Message.java
-- conversation_id: @ManyToOne(fetch=LAZY) @JoinColumn(name="conversation_id") NOT NULL
-- sender_role: @Enumerated(STRING) ParticipantRole → VARCHAR(50)
-- content: @Column(length=2000, nullable=false) → VARCHAR(2000) NOT NULL
CREATE TABLE message (
    id               VARCHAR(255) PRIMARY KEY,
    conversation_id  VARCHAR(255) NOT NULL REFERENCES chat_conversation(id),
    sender_id        VARCHAR(255),
    sender_role      VARCHAR(50),
    content          VARCHAR(2000) NOT NULL,
    sent_at          TIMESTAMP,
    read             BOOLEAN
);
