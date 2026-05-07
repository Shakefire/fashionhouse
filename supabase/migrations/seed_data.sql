-- Seed Data for Fashion Designer System

-- 1. Clear existing data (Optional, be careful)
-- TRUNCATE payments, orders, measurements, customers CASCADE;

-- 2. Insert Customers (10)
INSERT INTO customers (id, full_name, phone_number, address, notes, loyalty_tier) VALUES
('a1b1c1d1-1111-1111-1111-111111111111', 'Elizabeth Martins', '+234 801 234 5678', '12 Victoria Island, Lagos', 'Prefers silk fabrics', 'Gold'),
('a2b2c2d2-2222-2222-2222-222222222222', 'James Adebayo', '+234 802 345 6789', '45 Lekki Phase 1, Lagos', 'Always requests slim fit', 'Silver'),
('a3b3c3d3-3333-3333-3333-333333333333', 'Vera Daniels', '+234 803 456 7890', '88 Ikeja GRA, Lagos', 'Loves vibrant colors', 'Bronze'),
('a4b4c4d4-4444-4444-4444-444444444444', 'Anita Taylor', '+234 804 567 8901', '10 Abuja Crescent, Port Harcourt', 'Regular customer', 'Platinum'),
('a5b5c5d5-5555-5555-5555-555555555555', 'Frank Uooh', '+234 805 678 9012', '22 Trans Amadi, Port Harcourt', 'Prefers cotton', 'Silver'),
('a6b6c6d6-6666-6666-6666-666666666666', 'Sarah Jenkins', '+1 555 123 4567', '742 Evergreen Terrace, Springfield', 'Corporate client', 'Gold'),
('a7b7c7d7-7777-7777-7777-777777777777', 'Michael Chen', '+1 555 987 6543', '123 Silicon Valley Way, CA', 'Tech executive styles', 'Bronze'),
('a8b8c8d8-8888-8888-8888-888888888888', 'Fatima Bello', '+234 901 222 3333', '55 Gwarinpa Estate, Abuja', 'Loves embroidery', 'Silver'),
('a9b9c9d9-9999-9999-9999-999999999999', 'David Okoro', '+234 703 111 2222', '14 Independence Layout, Enugu', 'Traditional wear specialist', 'Bronze'),
('b1b1c1d1-1111-1111-1111-111111111111', 'Linda Mbeki', '+27 11 555 0123', '99 Sandton Blvd, Johannesburg', 'International shipping', 'Platinum');

-- 3. Insert Measurements (10)
INSERT INTO measurements (customer_id, fabric_type, bust, waist, hips, shoulder, length, neck, sleeve, inseam) VALUES
('a1b1c1d1-1111-1111-1111-111111111111', 'Silk', 34.0, 28.5, 36.0, 15.0, 42.0, 13.5, 23.0, 30.0),
('a2b2c2d2-2222-2222-2222-222222222222', 'Cotton', 40.0, 34.0, 42.0, 18.0, 30.0, 16.0, 25.0, 32.0),
('a3b3c3d3-3333-3333-3333-333333333333', 'Wool', 36.5, 30.0, 38.0, 15.5, 45.0, 14.0, 24.0, 31.0),
('a4b4c4d4-4444-4444-4444-444444444444', 'Lace', 33.0, 26.0, 35.0, 14.5, 58.0, 13.0, 22.5, 29.0),
('a5b5c5d5-5555-5555-5555-555555555555', 'Linen', 42.0, 36.5, 44.0, 19.0, 32.0, 17.0, 26.0, 33.0),
('a6b6c6d6-6666-6666-6666-666666666666', 'Polyester', 35.0, 29.0, 37.0, 15.0, 40.0, 13.5, 23.5, 30.5),
('a7b7c7d7-7777-7777-7777-777777777777', 'Gabardine', 38.0, 32.0, 40.0, 17.5, 31.0, 15.5, 25.5, 32.5),
('a8b8c8d8-8888-8888-8888-888888888888', 'Chiffon', 37.0, 31.5, 39.0, 16.0, 48.0, 14.5, 24.5, 31.5),
('a9b9c9d9-9999-9999-9999-999999999999', 'Ankara', 44.0, 38.0, 46.0, 19.5, 60.0, 17.5, 26.5, 34.0),
('b1b1c1d1-1111-1111-1111-111111111111', 'Velvet', 32.5, 25.5, 34.5, 14.0, 55.0, 12.5, 22.0, 28.5);

-- 4. Insert Orders (10)
INSERT INTO orders (id, order_number, customer_id, items, total_amount, status, deadline) VALUES
('c1c1c1c1-1111-1111-1111-111111111111', 'ORD-1001', 'a1b1c1d1-1111-1111-1111-111111111111', '[{"item": "Silk Gown", "qty": 1}]', 450.00, 'Completed', '2024-04-20'),
('c2c2c2c2-2222-2222-2222-222222222222', 'ORD-1002', 'a2b2c2d2-2222-2222-2222-222222222222', '[{"item": "Bespoke Suit", "qty": 1}]', 1200.00, 'In Progress', '2024-04-22'),
('c3c3c3c3-3333-3333-3333-333333333333', 'ORD-1003', 'a3b3c3d3-3333-3333-3333-333333333333', '[{"item": "Winter Coat", "qty": 1}]', 300.00, 'Pending', '2024-04-25'),
('c4c4c4c4-4444-4444-4444-444444444444', 'ORD-1004', 'a4b4c4d4-4444-4444-4444-444444444444', '[{"item": "Wedding Dress", "qty": 1}]', 3500.00, 'Pending', '2024-06-15'),
('c5c5c5c5-5555-5555-5555-555555555555', 'ORD-1005', 'a5b5c5d5-5555-5555-5555-555555555555', '[{"item": "Linen Shirt", "qty": 3}]', 250.00, 'Delivered', '2024-04-10'),
('c6c6c6c6-6666-6666-6666-666666666666', 'ORD-1006', 'a6b6c6d6-6666-6666-6666-666666666666', '[{"item": "Uniform Set", "qty": 10}]', 1500.00, 'In Progress', '2024-05-01'),
('c7c7c7c7-7777-7777-7777-777777777777', 'ORD-1007', 'a7b7c7d7-7777-7777-7777-777777777777', '[{"item": "Executive Blazer", "qty": 1}]', 600.00, 'Completed', '2024-04-18'),
('c8c8c8c8-8888-8888-8888-888888888888', 'ORD-1008', 'a8b8c8d8-8888-8888-8888-888888888888', '[{"item": "Party Gown", "qty": 1}]', 850.00, 'Pending', '2024-05-05'),
('c9c9c9c9-9999-9999-9999-999999999999', 'ORD-1009', 'a9b9c9d9-9999-9999-9999-999999999999', '[{"item": "Traditional Ensemble", "qty": 1}]', 700.00, 'In Progress', '2024-05-10'),
('d1d1d1d1-1111-1111-1111-111111111111', 'ORD-1010', 'b1b1c1d1-1111-1111-1111-111111111111', '[{"item": "Velvet Evening Wear", "qty": 1}]', 2000.00, 'Pending', '2024-12-25');

-- 5. Insert Payments (10)
INSERT INTO payments (order_id, amount, method, status, transaction_ref) VALUES
('c1c1c1c1-1111-1111-1111-111111111111', 450.00, 'Bank Transfer', 'Verified', 'REF-882211'),
('c2c2c2c2-2222-2222-2222-222222222222', 600.00, 'Debit Card', 'Verified', 'REF-776655'),
('c3c3c3c3-3333-3333-3333-333333333333', 100.00, 'Cash', 'Pending', 'CASH-REC-001'),
('c4c4c4c4-4444-4444-4444-444444444444', 1500.00, 'Bank Transfer', 'Verified', 'REF-990011'),
('c5c5c5c5-5555-5555-5555-555555555555', 250.00, 'Debit Card', 'Verified', 'REF-112233'),
('c6c6c6c6-6666-6666-6666-666666666666', 750.00, 'Bank Transfer', 'Pending', 'REF-445566'),
('c7c7c7c7-7777-7777-7777-777777777777', 600.00, 'Bank Transfer', 'Verified', 'REF-778899'),
('c8c8c8c8-8888-8888-8888-888888888888', 400.00, 'Cash', 'Verified', 'CASH-REC-002'),
('c9c9c9c9-9999-9999-9999-999999999999', 350.00, 'Debit Card', 'Verified', 'REF-554433'),
('d1d1d1d1-1111-1111-1111-111111111111', 1000.00, 'Bank Transfer', 'Verified', 'REF-223344');
