/* learn-sql-with-phoebe - the Daybreak running database
   One small SQLite warehouse for a DTC coffee-subscription brand.
   Every live playground on every page seeds a fresh copy of this before
   running your query, so nothing you type can break the next example.

   Schema (6 tables):
     customers(customer_id, name, city, country, signup_date, plan)
     products(product_id, name, category, price, roast)
     orders(order_id, customer_id, order_date, status, channel)
     order_items(order_id, product_id, quantity, unit_price)
     subscriptions(sub_id, customer_id, product_id, start_date, cancel_date, monthly_qty)
     events(event_id, customer_id, event_date, event_type)

   Story baked into the data: orders climb Jan -> Feb, dip hard in March
   (the case-study mystery in Builder Session 9), then recover. */

window.DAYBREAK_SEED = `
CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  city         TEXT,
  country      TEXT,
  signup_date  TEXT,
  plan         TEXT
);
INSERT INTO customers VALUES
 (1,'Ava Chen','Seattle','USA','2025-11-03','Pro'),
 (2,'Liam Ford','Austin','USA','2025-12-10','Basic'),
 (3,'Noah Park','Portland','USA','2026-01-05','Pro'),
 (4,'Mia Wong','Vancouver','Canada','2026-01-18','Basic'),
 (5,'Ethan Ruiz','Denver','USA','2026-01-22','Pro'),
 (6,'Sofia Rossi','Toronto','Canada','2026-02-02','Basic'),
 (7,'Jack Lee','Seattle','USA','2026-02-14','Pro'),
 (8,'Emma Stone','Chicago','USA','2026-02-20','Basic'),
 (9,'Lucas Kim','Austin','USA','2026-03-01','Pro'),
 (10,'Olivia Diaz','Miami','USA','2026-03-11','Basic'),
 (11,'Henry Cole','London','UK','2026-03-19','Pro'),
 (12,'Aria Shah','Toronto','Canada','2026-04-04','Basic'),
 (13,'Leo Meyer','Berlin','Germany','2026-04-15','Pro'),
 (14,'Zoe Tan','Singapore','Singapore','2026-05-02','Pro'),
 (15,'Max Bauer','Berlin','Germany','2026-05-20','Basic');

CREATE TABLE products (
  product_id  INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT,
  price       REAL,
  roast       TEXT
);
INSERT INTO products VALUES
 (1,'Sunrise Blend','Coffee',16.00,'Light'),
 (2,'Midnight Espresso','Coffee',18.00,'Dark'),
 (3,'Decaf Calm','Coffee',15.00,'Medium'),
 (4,'Cold Brew Kit','Equipment',34.00,NULL),
 (5,'Ceramic Dripper','Equipment',28.00,NULL),
 (6,'Oat Milk Pods','Add-on',9.00,NULL),
 (7,'Single-Origin Ethiopia','Coffee',22.00,'Light'),
 (8,'House Decaf Beans','Coffee',17.00,'Medium');

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER,
  order_date   TEXT,
  status       TEXT,
  channel      TEXT
);
INSERT INTO orders VALUES
 (1001,1,'2026-01-06','completed','web'),
 (1002,2,'2026-01-11','completed','app'),
 (1003,3,'2026-01-14','completed','web'),
 (1004,1,'2026-01-20','completed','app'),
 (1005,5,'2026-01-25','completed','web'),
 (1006,4,'2026-01-28','refunded','web'),
 (1007,3,'2026-02-03','completed','app'),
 (1008,6,'2026-02-05','completed','web'),
 (1009,2,'2026-02-09','completed','app'),
 (1010,7,'2026-02-15','completed','web'),
 (1011,1,'2026-02-18','completed','app'),
 (1012,8,'2026-02-21','completed','web'),
 (1013,5,'2026-02-24','completed','app'),
 (1014,6,'2026-02-27','cancelled','web'),
 (1015,3,'2026-03-04','completed','app'),
 (1016,9,'2026-03-08','completed','web'),
 (1017,1,'2026-03-15','refunded','app'),
 (1018,7,'2026-03-22','completed','web'),
 (1019,10,'2026-03-27','completed','app'),
 (1020,3,'2026-04-02','completed','web'),
 (1021,12,'2026-04-06','completed','app'),
 (1022,5,'2026-04-11','completed','web'),
 (1023,11,'2026-04-17','completed','app'),
 (1024,1,'2026-04-23','completed','web'),
 (1025,13,'2026-04-29','completed','app'),
 (1026,7,'2026-05-05','completed','web'),
 (1027,14,'2026-05-12','completed','app'),
 (1028,5,'2026-05-19','completed','web'),
 (1029,3,'2026-05-26','completed','app'),
 (1030,12,'2026-06-03','completed','web'),
 (1031,14,'2026-06-09','completed','app'),
 (1032,1,'2026-06-16','completed','web'),
 (1033,15,'2026-06-22','completed','app');

CREATE TABLE order_items (
  order_id    INTEGER,
  product_id  INTEGER,
  quantity    INTEGER,
  unit_price  REAL
);
INSERT INTO order_items VALUES
 (1001,1,2,16.00),(1001,6,1,9.00),
 (1002,2,1,18.00),
 (1003,7,1,22.00),(1003,5,1,28.00),
 (1004,1,1,16.00),(1004,3,2,15.00),
 (1005,2,2,18.00),(1005,6,2,9.00),
 (1006,4,1,34.00),
 (1007,7,2,22.00),
 (1008,1,1,16.00),(1008,2,1,18.00),
 (1009,3,1,15.00),(1009,6,1,9.00),
 (1010,2,3,18.00),
 (1011,7,1,22.00),(1011,5,1,28.00),
 (1012,1,2,16.00),
 (1013,2,1,18.00),(1013,3,1,15.00),
 (1014,4,1,34.00),(1014,6,1,9.00),
 (1015,7,2,22.00),
 (1016,1,1,16.00),(1016,2,1,18.00),
 (1017,3,1,15.00),
 (1018,7,1,22.00),(1018,6,2,9.00),
 (1019,1,2,16.00),
 (1020,2,2,18.00),(1020,5,1,28.00),
 (1021,3,1,15.00),(1021,6,1,9.00),
 (1022,7,2,22.00),
 (1023,1,1,16.00),(1023,2,1,18.00),
 (1024,7,1,22.00),(1024,3,1,15.00),
 (1025,2,2,18.00),
 (1026,1,2,16.00),(1026,6,1,9.00),
 (1027,7,3,22.00),
 (1028,2,1,18.00),(1028,5,1,28.00),
 (1029,3,2,15.00),
 (1030,1,1,16.00),(1030,2,1,18.00),
 (1031,7,2,22.00),(1031,6,1,9.00),
 (1032,1,3,16.00),
 (1033,2,1,18.00),(1033,3,1,15.00);

CREATE TABLE subscriptions (
  sub_id       INTEGER PRIMARY KEY,
  customer_id  INTEGER,
  product_id   INTEGER,
  start_date   TEXT,
  cancel_date  TEXT,
  monthly_qty  INTEGER
);
INSERT INTO subscriptions VALUES
 (1,1,1,'2025-11-03',NULL,2),
 (2,2,2,'2025-12-10','2026-03-10',1),
 (3,3,7,'2026-01-05',NULL,1),
 (4,5,2,'2026-01-22',NULL,2),
 (5,6,1,'2026-02-02','2026-04-02',1),
 (6,7,7,'2026-02-14',NULL,1),
 (7,9,2,'2026-03-01',NULL,2),
 (8,11,1,'2026-03-19',NULL,1),
 (9,13,7,'2026-04-15',NULL,1),
 (10,14,2,'2026-05-02',NULL,2);

CREATE TABLE events (
  event_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER,
  event_date   TEXT,
  event_type   TEXT
);
INSERT INTO events VALUES
 (1,1,'2026-03-01','login'),
 (2,1,'2026-03-15','support_ticket'),
 (3,3,'2026-03-02','login'),
 (4,7,'2026-03-05','login'),
 (5,9,'2026-03-06','login'),
 (6,2,'2026-03-09','cancel_survey'),
 (7,10,'2026-03-27','login'),
 (8,6,'2026-04-01','cancel_survey'),
 (9,11,'2026-04-10','login'),
 (10,14,'2026-05-12','login');
`;
