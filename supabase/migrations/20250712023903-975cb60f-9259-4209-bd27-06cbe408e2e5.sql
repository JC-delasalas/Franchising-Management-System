-- Insert comprehensive sample data for franchise management demo

-- Insert franchisor
INSERT INTO public.franchisor (franchisor_id, company_nm, legal_nm, contact_email, phone_no, street_addr, city, state_prov, postal_code, country, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Global Food Concepts', 'Global Food Concepts LLC', 'contact@globalfoodconcepts.com', '+1-555-0123', '123 Corporate Blvd', 'New York', 'NY', '10001', 'USA', 'active');

-- Insert brands
INSERT INTO public.brand (brand_id, franchisor_id, brand_nm, tagline, logo_url, details, metadata, marketing_data) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Fresh Burger Co', 'Fresh ingredients, bold flavors', '/brands/fresh-burger-logo.png', 'Premium burger franchise focused on fresh, locally-sourced ingredients', '{"established": 2015, "locations_target": 500}', '{"primary_color": "#FF6B35", "secondary_color": "#2E8B57"}'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Pizza Paradise', 'Authentic Italian taste', '/brands/pizza-paradise-logo.png', 'Traditional Italian pizza with modern convenience', '{"established": 2018, "locations_target": 300}', '{"primary_color": "#C41E3A", "secondary_color": "#FFD700"}'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Coffee Corner', 'Your daily dose of excellence', '/brands/coffee-corner-logo.png', 'Premium coffee experience with artisanal blends', '{"established": 2020, "locations_target": 200}', '{"primary_color": "#8B4513", "secondary_color": "#F5DEB3"}');

-- Insert franchisees
INSERT INTO public.franchisee (franchisee_id, brand_id, op_nm, legal_nm, contact_first_nm, contact_last_nm, contact_email, phone_no, onboarding_status, status, metadata, preferences) VALUES
-- Fresh Burger Co franchisees
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Fresh Burger Downtown', 'Downtown Burger LLC', 'John', 'Smith', 'john@downtownburger.com', '+1-555-0201', 'completed', 'active', '{"territory": "downtown", "investment_level": "standard"}', '{"marketing_budget": 5000, "staff_size": 15}'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Fresh Burger Mall', 'Mall Food Services Inc', 'Sarah', 'Johnson', 'sarah@mallfoodservices.com', '+1-555-0202', 'completed', 'active', '{"territory": "shopping_mall", "investment_level": "premium"}', '{"marketing_budget": 7500, "staff_size": 20}'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Fresh Burger Airport', 'Airport Dining Co', 'Michael', 'Davis', 'michael@airportdining.com', '+1-555-0203', 'completed', 'active', '{"territory": "airport", "investment_level": "premium"}', '{"marketing_budget": 10000, "staff_size": 25}'),
-- Pizza Paradise franchisees
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Pizza Paradise Central', 'Central Pizza LLC', 'Lisa', 'Wilson', 'lisa@centralpizza.com', '+1-555-0204', 'completed', 'active', '{"territory": "central_district", "investment_level": "standard"}', '{"marketing_budget": 4000, "staff_size": 12}'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Pizza Paradise North', 'North Side Food Co', 'Robert', 'Brown', 'robert@northsidefood.com', '+1-555-0205', 'completed', 'active', '{"territory": "north_district", "investment_level": "standard"}', '{"marketing_budget": 4500, "staff_size": 14}'),
-- Coffee Corner franchisees
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 'Coffee Corner Express', 'Express Coffee LLC', 'Emily', 'Taylor', 'emily@expresscoffee.com', '+1-555-0206', 'completed', 'active', '{"territory": "business_district", "investment_level": "standard"}', '{"marketing_budget": 3000, "staff_size": 8}'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'Coffee Corner Campus', 'Campus Coffee Inc', 'David', 'Anderson', 'david@campuscoffee.com', '+1-555-0207', 'completed', 'active', '{"territory": "university", "investment_level": "standard"}', '{"marketing_budget": 3500, "staff_size": 10}');

-- Insert locations
INSERT INTO public.location (location_id, franchisee_id, location_nm, street_addr, city, state_prov, postal_code, country, phone_no, email, opening_date, status, metadata, operating_hours) VALUES
-- Fresh Burger locations
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Fresh Burger Downtown Main', '456 Main Street', 'New York', 'NY', '10002', 'USA', '+1-555-1001', 'downtown@freshburger.com', '2023-01-15', 'active', '{"seating_capacity": 50, "drive_thru": true}', '{"monday": "6:00-22:00", "tuesday": "6:00-22:00", "wednesday": "6:00-22:00", "thursday": "6:00-22:00", "friday": "6:00-23:00", "saturday": "7:00-23:00", "sunday": "8:00-21:00"}'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Fresh Burger Mall Food Court', '789 Shopping Center', 'New York', 'NY', '10003', 'USA', '+1-555-1002', 'mall@freshburger.com', '2023-02-20', 'active', '{"seating_capacity": 30, "drive_thru": false}', '{"monday": "10:00-21:00", "tuesday": "10:00-21:00", "wednesday": "10:00-21:00", "thursday": "10:00-21:00", "friday": "10:00-22:00", "saturday": "10:00-22:00", "sunday": "11:00-20:00"}'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Fresh Burger Terminal A', 'JFK Airport Terminal A', 'Queens', 'NY', '11430', 'USA', '+1-555-1003', 'airport@freshburger.com', '2023-03-10', 'active', '{"seating_capacity": 40, "drive_thru": false}', '{"monday": "5:00-23:00", "tuesday": "5:00-23:00", "wednesday": "5:00-23:00", "thursday": "5:00-23:00", "friday": "5:00-23:00", "saturday": "5:00-23:00", "sunday": "5:00-23:00"}'),
-- Pizza Paradise locations
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Pizza Paradise Central Plaza', '321 Central Plaza', 'New York', 'NY', '10004', 'USA', '+1-555-1004', 'central@pizzaparadise.com', '2023-01-25', 'active', '{"seating_capacity": 60, "delivery": true}', '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-24:00", "saturday": "11:00-24:00", "sunday": "12:00-22:00"}'),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'Pizza Paradise North Side', '654 North Avenue', 'New York', 'NY', '10005', 'USA', '+1-555-1005', 'north@pizzaparadise.com', '2023-04-05', 'active', '{"seating_capacity": 45, "delivery": true}', '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-24:00", "saturday": "11:00-24:00", "sunday": "12:00-22:00"}'),
-- Coffee Corner locations
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 'Coffee Corner Business District', '987 Business Ave', 'New York', 'NY', '10006', 'USA', '+1-555-1006', 'business@coffeecorner.com', '2023-02-15', 'active', '{"seating_capacity": 25, "wifi": true}', '{"monday": "6:00-19:00", "tuesday": "6:00-19:00", "wednesday": "6:00-19:00", "thursday": "6:00-19:00", "friday": "6:00-19:00", "saturday": "7:00-18:00", "sunday": "8:00-17:00"}'),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', 'Coffee Corner University Campus', '123 University Blvd', 'New York', 'NY', '10007', 'USA', '+1-555-1007', 'campus@coffeecorner.com', '2023-03-01', 'active', '{"seating_capacity": 35, "wifi": true}', '{"monday": "6:00-20:00", "tuesday": "6:00-20:00", "wednesday": "6:00-20:00", "thursday": "6:00-20:00", "friday": "6:00-20:00", "saturday": "8:00-18:00", "sunday": "9:00-19:00"}');

-- Insert product categories
INSERT INTO public.product_category (category_id, brand_id, cat_nm, details) VALUES
-- Fresh Burger categories
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Burgers', 'Our signature burger collection'),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Sides', 'Fries, onion rings, and appetizers'),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Beverages', 'Soft drinks, shakes, and more'),
-- Pizza Paradise categories
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Pizzas', 'Traditional and specialty pizzas'),
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Appetizers', 'Garlic bread, wings, and salads'),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Beverages', 'Sodas, juices, and Italian drinks'),
-- Coffee Corner categories
('990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'Coffee', 'Espresso, americano, and specialty drinks'),
('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'Pastries', 'Fresh baked goods and desserts'),
('990e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Tea & Others', 'Tea, hot chocolate, and cold drinks');

-- Insert products (40+ products)
INSERT INTO public.product (product_id, brand_id, category_id, product_nm, details, sku, unit_price, is_active, metadata, custom_attributes) VALUES
-- Fresh Burger products
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Classic Beef Burger', 'Quarter pound beef patty with lettuce, tomato, onion', 'FB-BURGER-001', 12.99, true, '{"calories": 520, "prep_time": "8 minutes"}', '{"allergens": ["gluten", "dairy"], "spice_level": "mild"}'),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Bacon Deluxe Burger', 'Beef patty with crispy bacon, cheese, special sauce', 'FB-BURGER-002', 15.99, true, '{"calories": 680, "prep_time": "10 minutes"}', '{"allergens": ["gluten", "dairy"], "spice_level": "mild"}'),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Veggie Burger', 'Plant-based patty with avocado and sprouts', 'FB-BURGER-003', 13.99, true, '{"calories": 420, "prep_time": "8 minutes"}', '{"allergens": ["gluten"], "spice_level": "mild", "vegan": true}'),
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'Fresh Cut Fries', 'Hand-cut potato fries with sea salt', 'FB-SIDE-001', 4.99, true, '{"calories": 320, "prep_time": "5 minutes"}', '{"allergens": [], "size_options": ["small", "medium", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'Onion Rings', 'Beer-battered onion rings', 'FB-SIDE-002', 5.99, true, '{"calories": 280, "prep_time": "6 minutes"}', '{"allergens": ["gluten"], "spice_level": "mild"}'),
('aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'Vanilla Milkshake', 'Creamy vanilla milkshake', 'FB-BEV-001', 6.99, true, '{"calories": 450, "prep_time": "3 minutes"}', '{"allergens": ["dairy"], "size_options": ["regular", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'Fresh Lemonade', 'House-made lemonade', 'FB-BEV-002', 3.99, true, '{"calories": 120, "prep_time": "2 minutes"}', '{"allergens": [], "size_options": ["regular", "large"]}'),
-- Pizza Paradise products
('aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'Margherita Pizza', 'Fresh mozzarella, basil, tomato sauce', 'PP-PIZZA-001', 16.99, true, '{"calories": 800, "prep_time": "15 minutes"}', '{"allergens": ["gluten", "dairy"], "size_options": ["small", "medium", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'Pepperoni Supreme', 'Pepperoni, mushrooms, bell peppers, cheese', 'PP-PIZZA-002', 19.99, true, '{"calories": 950, "prep_time": "15 minutes"}', '{"allergens": ["gluten", "dairy"], "size_options": ["small", "medium", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'Quattro Stagioni', 'Four seasons pizza with various toppings', 'PP-PIZZA-003', 22.99, true, '{"calories": 1050, "prep_time": "18 minutes"}', '{"allergens": ["gluten", "dairy"], "size_options": ["medium", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'Garlic Bread', 'Fresh baked garlic bread with herbs', 'PP-APP-001', 7.99, true, '{"calories": 320, "prep_time": "8 minutes"}', '{"allergens": ["gluten", "dairy"]}'),
('aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'Caesar Salad', 'Romaine lettuce, parmesan, croutons', 'PP-APP-002', 9.99, true, '{"calories": 280, "prep_time": "5 minutes"}', '{"allergens": ["gluten", "dairy"]}'),
('aa0e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', 'Italian Soda', 'Sparkling water with fruit syrup', 'PP-BEV-001', 4.99, true, '{"calories": 90, "prep_time": "2 minutes"}', '{"allergens": [], "flavors": ["lemon", "orange", "cherry"]}'),
-- Coffee Corner products
('aa0e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440007', 'Espresso', 'Single shot of premium espresso', 'CC-COFFEE-001', 2.99, true, '{"calories": 5, "prep_time": "2 minutes"}', '{"allergens": [], "caffeine": "high", "size_options": ["single", "double"]}'),
('aa0e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440007', 'Cappuccino', 'Espresso with steamed milk foam', 'CC-COFFEE-002', 4.99, true, '{"calories": 120, "prep_time": "4 minutes"}', '{"allergens": ["dairy"], "caffeine": "medium", "size_options": ["regular", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440007', 'Caramel Latte', 'Espresso with steamed milk and caramel', 'CC-COFFEE-003', 5.99, true, '{"calories": 250, "prep_time": "5 minutes"}', '{"allergens": ["dairy"], "caffeine": "medium", "size_options": ["regular", "large"]}'),
('aa0e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440008', 'Croissant', 'Buttery French croissant', 'CC-PASTRY-001', 3.99, true, '{"calories": 230, "prep_time": "1 minute"}', '{"allergens": ["gluten", "dairy"]}'),
('aa0e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440008', 'Blueberry Muffin', 'Fresh baked blueberry muffin', 'CC-PASTRY-002', 4.99, true, '{"calories": 320, "prep_time": "1 minute"}', '{"allergens": ["gluten", "dairy", "eggs"]}'),
('aa0e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440009', 'Green Tea', 'Premium loose leaf green tea', 'CC-TEA-001', 3.99, true, '{"calories": 2, "prep_time": "3 minutes"}', '{"allergens": [], "caffeine": "low"}'),
('aa0e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440009', 'Hot Chocolate', 'Rich hot chocolate with whipped cream', 'CC-HOT-001', 4.99, true, '{"calories": 320, "prep_time": "4 minutes"}', '{"allergens": ["dairy"], "size_options": ["regular", "large"]}');

-- Insert customers (20 customers)
INSERT INTO public.customer (customer_id, franchisor_id, first_nm, last_nm, email, phone_no, loyalty_member) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-2001', true),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Bob', 'Smith', 'bob.smith@email.com', '+1-555-2002', false),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Carol', 'Williams', 'carol.williams@email.com', '+1-555-2003', true),
('bb0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'David', 'Brown', 'david.brown@email.com', '+1-555-2004', true),
('bb0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Emma', 'Davis', 'emma.davis@email.com', '+1-555-2005', false),
('bb0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Frank', 'Miller', 'frank.miller@email.com', '+1-555-2006', true),
('bb0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Grace', 'Wilson', 'grace.wilson@email.com', '+1-555-2007', false),
('bb0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Henry', 'Moore', 'henry.moore@email.com', '+1-555-2008', true),
('bb0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Iris', 'Taylor', 'iris.taylor@email.com', '+1-555-2009', true),
('bb0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Jack', 'Anderson', 'jack.anderson@email.com', '+1-555-2010', false),
('bb0e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Kate', 'Thomas', 'kate.thomas@email.com', '+1-555-2011', true),
('bb0e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Liam', 'Jackson', 'liam.jackson@email.com', '+1-555-2012', false),
('bb0e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Mia', 'White', 'mia.white@email.com', '+1-555-2013', true),
('bb0e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Noah', 'Harris', 'noah.harris@email.com', '+1-555-2014', true),
('bb0e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', 'Olivia', 'Martin', 'olivia.martin@email.com', '+1-555-2015', false),
('bb0e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', 'Paul', 'Garcia', 'paul.garcia@email.com', '+1-555-2016', true),
('bb0e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', 'Quinn', 'Rodriguez', 'quinn.rodriguez@email.com', '+1-555-2017', false),
('bb0e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440000', 'Ruby', 'Lewis', 'ruby.lewis@email.com', '+1-555-2018', true),
('bb0e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440000', 'Sam', 'Lee', 'sam.lee@email.com', '+1-555-2019', true),
('bb0e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Tina', 'Walker', 'tina.walker@email.com', '+1-555-2020', false);