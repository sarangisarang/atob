insert into customer (id,email,first_name,last_name,password,address,postcode,city,phone) values ('1','bekakikalishvili@gmail.com','lilian','mircos','dushqu','birkestrase50','40233','dusseldorf','015434232');
insert into customer (id,email,first_name,last_name,password,address,postcode,city,phone) values ('2','sofia@gmail.com','sofio','abuladze','dushqu','birkestrase50','40233','dusseldorf','0152322');
insert into carrier (id,email,first_name,last_name,password,address,postcode,city,phone) values ('1','beka@gmail.com','beka','imnadze','dushqu','Birkestrase50','40233','Dusseldorf','015434232');
insert into location (id,address,postcode,city,phone) values ('1','Doctor LLanso 117','07740','Menorca','33434');
insert into location (id,address,postcode,city,phone) values ('2','Doctor LLanso 114','07740','Alayor','33434');
insert into product (id,product_name,product_desc,stock,carrier_id) values ('1','Car','BMW',30000,'1');
insert into transport_order (id,order_id,order_no,order_date,shipping_date,shippingfrom_id,shippingto_id,product_id,customer_id,order_status) values ('1','ORD-001',10,'2023-10-11','2023-10-11','1','2','1','1','Pending');
insert into shipping (id,delivery_start_at,delivery_end_at,carrier_id,order_id,tracking_longitude,tracking_latitude,carrier_status) values ('1','2023-10-11','2023-11-23','1','1',6.7903674740777324,51.23070894321033,'Assigned');
insert into service_user (id, username, password) values ('1', 'admin', '{bcrypt}$2a$10$.jR4BzWbWZCUM3KPXIv9w.lBEZTX39bIUD7.njxDBbuTvTzPweb9K');
insert into user_role (id, role_name, user_id) values ('1', 'ROLE_ADMIN', '1');
insert into chat_conversation
(id, customer_id, driver_id, shipping_id, active, created_at, updated_at)
values
('conv-1', '1', '1', '1', true, '2026-05-26 10:00:00', '2026-05-26 10:00:00');

insert into message
(id, conversation_id, sender_id, sender_role, content, sent_at, read)
values
('msg-1', 'conv-1', '1', 'CUSTOMER', 'Hello, where is my shipment?', '2026-05-26 10:01:00', true);

insert into message
(id, conversation_id, sender_id, sender_role, content, sent_at, read)
values
('msg-2', 'conv-1', '1', 'DRIVER', 'On the way, arriving tomorrow!', '2026-05-26 10:05:00', true);