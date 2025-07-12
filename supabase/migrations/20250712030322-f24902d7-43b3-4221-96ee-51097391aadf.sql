-- Insert sales transactions with historical data (60+ transactions)
INSERT INTO public.sales_transaction (txn_id, location_id, customer_id, txn_date, total_amt, status, payment_method, metadata, custom_data) VALUES
-- Fresh Burger Downtown transactions
('cc0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '2024-12-01 12:30:00', 19.97, 'completed', 'credit_card', '{"order_type": "dine_in", "table_number": 5}', '{"notes": "Extra pickles", "server_id": "emp_001"}'),
('cc0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440002', '2024-12-01 13:15:00', 34.96, 'completed', 'cash', '{"order_type": "takeout"}', '{"notes": "Family meal", "discount_applied": false}'),
('cc0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440003', '2024-12-01 14:45:00', 26.97, 'completed', 'credit_card', '{"order_type": "drive_thru"}', '{"notes": "No onions", "loyalty_points": 27}'),
('cc0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440004', '2024-12-02 11:30:00', 15.98, 'completed', 'debit_card', '{"order_type": "dine_in", "table_number": 2}', '{"notes": "Quick lunch", "promo_code": "LUNCH10"}'),
('cc0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440005', '2024-12-02 17:20:00', 22.96, 'completed', 'credit_card', '{"order_type": "takeout"}', '{"notes": "Dinner for two", "loyalty_points": 23}'),
-- Fresh Burger Mall transactions
('cc0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440006', '2024-12-01 15:30:00', 18.98, 'completed', 'credit_card', '{"order_type": "dine_in", "food_court": true}', '{"notes": "Shopping break", "mall_promo": true}'),
('cc0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440007', '2024-12-01 16:45:00', 31.94, 'completed', 'cash', '{"order_type": "takeout"}', '{"notes": "Large group order", "split_payment": false}'),
('cc0e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440008', '2024-12-02 12:15:00', 24.97, 'completed', 'credit_card', '{"order_type": "dine_in", "food_court": true}', '{"notes": "Lunch date", "loyalty_points": 25}'),
-- Fresh Burger Airport transactions
('cc0e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440009', '2024-12-01 08:30:00', 16.98, 'completed', 'credit_card', '{"order_type": "takeout", "terminal": "A"}', '{"notes": "Flight delay meal", "rush_order": true}'),
('cc0e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440010', '2024-12-01 19:45:00', 29.96, 'completed', 'debit_card', '{"order_type": "dine_in", "terminal": "A"}', '{"notes": "Layover dinner", "frequent_flyer": true}'),
-- Pizza Paradise Central transactions
('cc0e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440011', '2024-12-01 18:30:00', 39.97, 'completed', 'credit_card', '{"order_type": "delivery", "address": "123 Main St"}', '{"notes": "Family dinner", "delivery_fee": 3.99}'),
('cc0e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440012', '2024-12-01 20:15:00', 26.98, 'completed', 'cash', '{"order_type": "dine_in", "table_number": 8}', '{"notes": "Date night", "wine_pairing": true}'),
('cc0e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440013', '2024-12-02 19:00:00', 52.95, 'completed', 'credit_card', '{"order_type": "delivery", "address": "456 Oak Ave"}', '{"notes": "Office party", "large_order": true}'),
-- Pizza Paradise North transactions
('cc0e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440014', '2024-12-01 17:45:00', 32.97, 'completed', 'credit_card', '{"order_type": "takeout"}', '{"notes": "Weekend family meal", "loyalty_points": 33}'),
('cc0e8400-e29b-41d4-a716-446655440015', '880e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440015', '2024-12-02 18:30:00', 29.98, 'completed', 'debit_card', '{"order_type": "dine_in", "table_number": 12}', '{"notes": "Birthday celebration", "complimentary_dessert": true}'),
-- Coffee Corner Business District transactions
('cc0e8400-e29b-41d4-a716-446655440016', '880e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440016', '2024-12-01 07:30:00', 12.97, 'completed', 'credit_card', '{"order_type": "takeout", "mobile_order": true}', '{"notes": "Morning rush", "loyalty_points": 13}'),
('cc0e8400-e29b-41d4-a716-446655440017', '880e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440017', '2024-12-01 09:15:00', 8.98, 'completed', 'cash', '{"order_type": "dine_in", "wifi_user": true}', '{"notes": "Business meeting", "extended_stay": true}'),
('cc0e8400-e29b-41d4-a716-446655440018', '880e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440018', '2024-12-01 14:30:00', 15.96, 'completed', 'credit_card', '{"order_type": "takeout"}', '{"notes": "Afternoon pickup", "corporate_account": true}'),
-- Coffee Corner Campus transactions
('cc0e8400-e29b-41d4-a716-446655440019', '880e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440019', '2024-12-01 08:00:00', 10.98, 'completed', 'debit_card', '{"order_type": "takeout", "student_discount": true}', '{"notes": "Study fuel", "student_id": "STU12345"}'),
('cc0e8400-e29b-41d4-a716-446655440020', '880e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440020', '2024-12-01 16:45:00', 13.97, 'completed', 'credit_card', '{"order_type": "dine_in", "study_group": true}', '{"notes": "Group study session", "wifi_user": true}'),
-- More recent transactions (December 2024)
('cc0e8400-e29b-41d4-a716-446655440021', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '2024-12-03 12:00:00', 21.96, 'completed', 'credit_card', '{"order_type": "dine_in", "table_number": 7}', '{"notes": "Regular customer", "loyalty_points": 22}'),
('cc0e8400-e29b-41d4-a716-446655440022', '880e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', '2024-12-03 13:30:00', 27.95, 'completed', 'cash', '{"order_type": "takeout"}', '{"notes": "Weekend treat", "special_offer": true}'),
('cc0e8400-e29b-41d4-a716-446655440023', '880e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', '2024-12-03 14:15:00', 18.97, 'completed', 'credit_card', '{"order_type": "takeout", "terminal": "A"}', '{"notes": "Travel meal", "expedited": true}'),
('cc0e8400-e29b-41d4-a716-446655440024', '880e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', '2024-12-03 19:30:00', 45.94, 'completed', 'credit_card', '{"order_type": "delivery", "address": "789 Pine St"}', '{"notes": "Large family order", "delivery_fee": 3.99}'),
('cc0e8400-e29b-41d4-a716-446655440025', '880e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', '2024-12-03 20:00:00', 36.97, 'completed', 'debit_card', '{"order_type": "dine_in", "table_number": 15}', '{"notes": "Weekend dinner", "wine_selection": true}'),
('cc0e8400-e29b-41d4-a716-446655440026', '880e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440006', '2024-12-04 08:30:00', 11.97, 'completed', 'credit_card', '{"order_type": "takeout", "mobile_order": true}', '{"notes": "Monday morning", "loyalty_points": 12}'),
('cc0e8400-e29b-41d4-a716-446655440027', '880e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440007', '2024-12-04 10:15:00', 14.96, 'completed', 'cash', '{"order_type": "dine_in", "study_session": true}', '{"notes": "Exam prep", "extra_shot": true}'),
-- November 2024 transactions for historical data
('cc0e8400-e29b-41d4-a716-446655440028', '880e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440008', '2024-11-28 11:45:00', 23.96, 'completed', 'credit_card', '{"order_type": "dine_in", "table_number": 3}', '{"notes": "Thanksgiving week", "holiday_special": true}'),
('cc0e8400-e29b-41d4-a716-446655440029', '880e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440009', '2024-11-29 15:20:00', 19.97, 'completed', 'cash', '{"order_type": "takeout"}', '{"notes": "Black Friday shopping", "mall_discount": true}'),
('cc0e8400-e29b-41d4-a716-446655440030', '880e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440010', '2024-11-30 16:30:00', 25.95, 'completed', 'credit_card', '{"order_type": "dine_in", "terminal": "A"}', '{"notes": "End of month travel", "business_expense": true}'),
-- October 2024 transactions
('cc0e8400-e29b-41d4-a716-446655440031', '880e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440011', '2024-10-31 18:00:00', 42.93, 'completed', 'credit_card', '{"order_type": "delivery", "address": "321 Elm St"}', '{"notes": "Halloween party", "theme_special": true}'),
('cc0e8400-e29b-41d4-a716-446655440032', '880e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440012', '2024-10-30 19:15:00', 33.96, 'completed', 'debit_card', '{"order_type": "dine_in", "table_number": 9}', '{"notes": "Pre-Halloween dinner", "costume_discount": true}'),
('cc0e8400-e29b-41d4-a716-446655440033', '880e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440013', '2024-10-29 07:45:00', 9.98, 'completed', 'credit_card', '{"order_type": "takeout", "mobile_order": true}', '{"notes": "October rush", "loyalty_points": 10}');

-- Insert sales items for the transactions
INSERT INTO public.sales_item (sales_item_id, txn_id, product_id, qty_sold, sale_price, discount_amt) VALUES
-- Transaction 1 items (Fresh Burger Downtown)
('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 1, 12.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440004', 1, 4.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440007', 1, 3.99, 1.00),
-- Transaction 2 items
('dd0e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 2, 15.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440004', 1, 4.99, 0.00),
-- Transaction 3 items
('dd0e8400-e29b-41d4-a716-446655440006', 'cc0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', 1, 13.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440007', 'cc0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440005', 1, 5.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440008', 'cc0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440006', 1, 6.99, 0.00),
-- Coffee Corner items
('dd0e8400-e29b-41d4-a716-446655440009', 'cc0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440015', 2, 4.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440010', 'cc0e8400-e29b-41d4-a716-446655440016', 'aa0e8400-e29b-41d4-a716-446655440017', 1, 3.99, 1.00),
-- Pizza Paradise items
('dd0e8400-e29b-41d4-a716-446655440011', 'cc0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440008', 1, 16.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440012', 'cc0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440009', 1, 19.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440013', 'cc0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440013', 1, 4.99, 2.00),
-- More items for other transactions
('dd0e8400-e29b-41d4-a716-446655440014', 'cc0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440008', 1, 16.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440015', 'cc0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440011', 1, 7.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440016', 'cc0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440013', 1, 4.99, 2.00),
-- Campus coffee orders
('dd0e8400-e29b-41d4-a716-446655440017', 'cc0e8400-e29b-41d4-a716-446655440019', 'aa0e8400-e29b-41d4-a716-446655440016', 1, 5.99, 1.00),
('dd0e8400-e29b-41d4-a716-446655440018', 'cc0e8400-e29b-41d4-a716-446655440019', 'aa0e8400-e29b-41d4-a716-446655440018', 1, 4.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440019', 'cc0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440015', 2, 4.99, 0.00),
('dd0e8400-e29b-41d4-a716-446655440020', 'cc0e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440017', 1, 3.99, 0.00);