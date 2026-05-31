-- ============================================================
-- R__seed_test_data.sql  (Repeatable migration — dev only)
-- Flyway re-runs this file whenever it changes (checksum-based).
-- ============================================================

TRUNCATE TABLE
    tracking_event,
    cargo,
    message,
    chat_conversation,
    user_role,
    service_user,
    shipping,
    transport_order,
    product,
    location,
    vehicle,
    carrier,
    customer
RESTART IDENTITY CASCADE;

-- ─── Customers ───────────────────────────────────────────────────────────────
INSERT INTO customer (id, email, first_name, last_name, password, address, postcode, city, phone)
VALUES ('1', 'bekakikalishvili@gmail.com', 'lilian', 'mircos',  'dushqu', 'Birkestrase 50', '40233', 'Dusseldorf', '015434232');

INSERT INTO customer (id, email, first_name, last_name, password, address, postcode, city, phone)
VALUES ('2', 'sofia@gmail.com', 'sofio', 'abuladze', 'dushqu', 'Birkestrase 50', '40233', 'Dusseldorf', '0152322');

-- ─── Carriers (Drivers) ──────────────────────────────────────────────────────
INSERT INTO carrier (id, email, first_name, last_name, password, address, postcode, city, phone)
VALUES ('1', 'beka@gmail.com',   'beka',   'imnadze', 'dushqu',  'Birkestrase 50', '40233', 'Dusseldorf', '015434232');

INSERT INTO carrier (id, email, first_name, last_name, password, address, postcode, city, phone)
VALUES ('2', 'giorgi@gmail.com', 'giorgi', 'beridze',  'pass123', 'Rustaveli 1',   '0105',  'Tbilisi',   '599123456');

-- ─── Vehicles ────────────────────────────────────────────────────────────────
INSERT INTO vehicle (id, plate_number, vehicle_type, max_weight_kg, max_volume_m3, active, carrier_id)
VALUES ('v1', 'DD-AB-1234', 'TRUCK',   20000, 80.0, true, '1');

INSERT INTO vehicle (id, plate_number, vehicle_type, max_weight_kg, max_volume_m3, active, carrier_id)
VALUES ('v2', 'DD-XY-5678', 'TRAILER', 40000, 120.0, true, '1');

INSERT INTO vehicle (id, plate_number, vehicle_type, max_weight_kg, max_volume_m3, active, carrier_id)
VALUES ('v3', 'TBS-100-AA', 'VAN',     3500,  12.0, true, '2');

-- ─── Locations ───────────────────────────────────────────────────────────────
INSERT INTO location (id, address, postcode, city, phone)
VALUES ('1', 'Doctor LLanso 117', 7740, 'Menorca', 33434);

INSERT INTO location (id, address, postcode, city, phone)
VALUES ('2', 'Doctor LLanso 114', 7740, 'Alayor', 33434);

INSERT INTO location (id, address, postcode, city, phone)
VALUES ('3', 'Rustaveli Avenue 1', 105, 'Tbilisi', 32100001);

INSERT INTO location (id, address, postcode, city, phone)
VALUES ('4', 'Kostava Street 5', 171, 'Tbilisi', 32100002);

-- ─── Products ────────────────────────────────────────────────────────────────
INSERT INTO product (id, product_name, product_desc, stock, carrier_id, has_image)
VALUES ('1', 'Car',         'BMW 3 Series',   30000, '1', false);

INSERT INTO product (id, product_name, product_desc, stock, carrier_id, has_image)
VALUES ('2', 'Electronics', 'Laptop batch',     150, '1', false);

INSERT INTO product (id, product_name, product_desc, stock, carrier_id, has_image)
VALUES ('3', 'Furniture',   'Office chairs',     45, '1', false);

-- ─── Transport Orders ────────────────────────────────────────────────────────
INSERT INTO transport_order (id, order_id, order_no, order_date, shipping_date, shippingfrom_id, shippingto_id, product_id, customer_id, order_status)
VALUES ('1', 'ORD-001', 10, '2023-10-11', '2023-10-11', '1', '2', '1', '1', 'Pending');

INSERT INTO transport_order (id, order_id, order_no, order_date, shipping_date, shippingfrom_id, shippingto_id, product_id, customer_id, order_status)
VALUES ('2', 'ORD-002', 11, '2026-05-20', '2026-05-22', '3', '4', '2', '2', 'WaitingCarrier');

-- ─── Shippings ───────────────────────────────────────────────────────────────
INSERT INTO shipping (id, delivery_start_at, delivery_end_at, carrier_id, vehicle_id, order_id,
                      tracking_longitude, tracking_latitude, shipping_status, transport_type, updated_at)
VALUES ('1', '2023-10-11', '2023-11-23', '1', 'v1', '1',
        6.7903674740777324, 51.23070894321033, 'ASSIGNED', 'TRUCK', NOW());

INSERT INTO shipping (id, delivery_start_at, delivery_end_at, carrier_id, vehicle_id, order_id,
                      tracking_longitude, tracking_latitude, shipping_status, transport_type, updated_at)
VALUES ('2', '2026-05-22', '2026-05-25', '2', 'v3', '2',
        44.8027, 41.6941, 'CREATED', 'LIGHT', NOW());

-- ─── Spring Security Users ───────────────────────────────────────────────────
INSERT INTO service_user (id, username, password)
VALUES ('1', 'admin', '{bcrypt}$2a$10$.jR4BzWbWZCUM3KPXIv9w.lBEZTX39bIUD7.njxDBbuTvTzPweb9K');
INSERT INTO user_role (id, role_name, user_id) VALUES ('1', 'ROLE_ADMIN', '1');

INSERT INTO service_user (id, username, password)
VALUES ('2', 'beka@gmail.com', '{noop}dushqu');
INSERT INTO user_role (id, role_name, user_id) VALUES ('2', 'ROLE_DRIVER', '2');

INSERT INTO service_user (id, username, password)
VALUES ('3', 'giorgi@gmail.com', '{noop}pass123');
INSERT INTO user_role (id, role_name, user_id) VALUES ('3', 'ROLE_DRIVER', '3');

INSERT INTO service_user (id, username, password)
VALUES ('4', 'bekakikalishvili@gmail.com', '{noop}dushqu');
INSERT INTO user_role (id, role_name, user_id) VALUES ('4', 'ROLE_CUSTOMER', '4');

INSERT INTO service_user (id, username, password)
VALUES ('5', 'sofia@gmail.com', '{noop}dushqu');
INSERT INTO user_role (id, role_name, user_id) VALUES ('5', 'ROLE_CUSTOMER', '5');

-- ─── Chat ────────────────────────────────────────────────────────────────────
INSERT INTO chat_conversation (id, customer_id, driver_id, shipping_id, active, created_at, updated_at)
VALUES ('conv-1', '1', '1', '1', true, '2026-05-25 10:00:00', '2026-05-25 10:05:00');

INSERT INTO message (id, conversation_id, sender_id, sender_role, content, sent_at, read)
VALUES ('msg-1', 'conv-1', '1', 'CUSTOMER', 'Hello, where is my shipment?',   '2026-05-25 10:00:00', true);

INSERT INTO message (id, conversation_id, sender_id, sender_role, content, sent_at, read)
VALUES ('msg-2', 'conv-1', '1', 'DRIVER',   'On the way, arriving tomorrow!', '2026-05-25 10:05:00', true);
