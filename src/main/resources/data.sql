insert into Customer (id,email,first_Name,last_Name,Password,Address,Postcode,City,Phone) values ('1','bekakikalishvili@gmail.com','lilian','mircos','dushqu','birkestrase50', 40233, 'dusseldorf', 015434232);
insert into Carrier (id,email,first_Name,last_Name,Password,Address,Postcode,City,Phone) values ('1','beka@gmail.com','beka','imnadze','dushqu','Birkestrase50', 40233, 'Dusseldorf', 015434232);
insert into Location (id,Address,Postcode,City,Phone) values ('1','Doctor LLanso 117','07740','Menorca',33434);
insert into Location (id,Address,Postcode,City,Phone) values ('2','Doctor LLanso 114','07740','Alayor',33434);
insert into Product (id,product_Name,product_Desc,image1,image2,image3,image4,image5,image6,Stock,Carrier_id) values ('1','Car','BMW','dushqu1','dushqu2','dushqu3','dushqu4','dushqu5','dushqu6',30000,'1');
insert into Transport_Order (id,order_Id,order_No,order_Date,shipping_Date,is_Delivered,shippingfrom_id,shippingto_id,Product_id,Customer_id) values ('1','1',10,'2023-10-11','2023-10-11','2023-10-11','1','2','1','1');
insert into Shippment(id,carrier_id,order_Id,status) values ('1','1','1','Pending');