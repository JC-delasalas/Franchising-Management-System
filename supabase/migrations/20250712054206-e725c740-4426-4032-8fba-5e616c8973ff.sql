-- Insert demo data for testing inventory functionality

-- Insert sample brands
INSERT INTO public.brand (brand_id, franchisor_id, brand_nm, tagline, details) 
VALUES 
  (gen_random_uuid(), (SELECT franchisor_id FROM public.franchisor LIMIT 1), 'Demo Coffee Shop', 'Premium Coffee Experience', 'A demo brand for coffee franchise operations'),
  (gen_random_uuid(), (SELECT franchisor_id FROM public.franchisor LIMIT 1), 'Demo Restaurant', 'Delicious Food & Service', 'A demo brand for restaurant franchise operations')
ON CONFLICT (brand_id) DO NOTHING;

-- Insert sample franchisees
INSERT INTO public.franchisee (franchisee_id, brand_id, op_nm, legal_nm, contact_email, contact_first_nm, contact_last_nm, phone_no) 
VALUES 
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), 'Demo Franchisee Store 1', 'Demo Franchisee LLC', 'demo@franchisee.com', 'Demo', 'Franchisee', '+63-912-345-6789'),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), 'Demo Franchisee Store 2', 'Demo Franchisee Corp', 'demo2@franchisee.com', 'Demo2', 'Franchisee', '+63-912-345-6790')
ON CONFLICT (franchisee_id) DO NOTHING;

-- Insert sample locations
INSERT INTO public.location (location_id, franchisee_id, location_nm, street_addr, city, state_prov, country, phone_no, email)
VALUES 
  (gen_random_uuid(), (SELECT franchisee_id FROM public.franchisee LIMIT 1), 'Main Street Store', '123 Main Street', 'Quezon City', 'Metro Manila', 'Philippines', '+63-2-123-4567', 'mainstore@demo.com'),
  (gen_random_uuid(), (SELECT franchisee_id FROM public.franchisee ORDER BY created_at DESC LIMIT 1), 'Mall Store', '456 Mall Avenue', 'Makati', 'Metro Manila', 'Philippines', '+63-2-765-4321', 'mallstore@demo.com')
ON CONFLICT (location_id) DO NOTHING;

-- Insert sample product categories
INSERT INTO public.product_category (category_id, brand_id, cat_nm, details)
VALUES 
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), 'Beverages', 'Hot and cold drinks'),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), 'Food', 'Sandwiches, pastries, and meals'),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), 'Supplies', 'Packaging and operational supplies')
ON CONFLICT (category_id) DO NOTHING;

-- Insert sample products
INSERT INTO public.product (product_id, brand_id, category_id, product_nm, details, sku, unit_price)
VALUES 
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Beverages' LIMIT 1), 'Espresso Coffee', 'Premium espresso blend', 'ESP001', 120.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Beverages' LIMIT 1), 'Cappuccino', 'Classic cappuccino with steamed milk', 'CAP001', 150.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Beverages' LIMIT 1), 'Iced Coffee', 'Refreshing iced coffee blend', 'ICE001', 130.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Food' LIMIT 1), 'Club Sandwich', 'Triple-decker club sandwich', 'SAND001', 280.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Food' LIMIT 1), 'Chocolate Croissant', 'Buttery croissant with chocolate filling', 'CROI001', 95.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Supplies' LIMIT 1), 'Paper Cups (16oz)', 'Disposable paper cups', 'CUP001', 5.50),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Supplies' LIMIT 1), 'Napkins Pack', 'Table napkins 100-pack', 'NAP001', 45.00),
  (gen_random_uuid(), (SELECT brand_id FROM public.brand LIMIT 1), (SELECT category_id FROM public.product_category WHERE cat_nm = 'Supplies' LIMIT 1), 'Take-out Bags', 'Brown paper take-out bags', 'BAG001', 3.25)
ON CONFLICT (product_id) DO NOTHING;

-- Insert sample inventory levels
INSERT INTO public.inventory (inventory_id, location_id, product_id, current_stock, min_stock_level)
SELECT 
  gen_random_uuid(),
  l.location_id,
  p.product_id,
  CASE 
    WHEN p.product_nm LIKE '%Cup%' THEN 150  -- Lower stock for cups to show low stock alert
    WHEN p.product_nm LIKE '%Napkins%' THEN 8   -- Very low stock for napkins
    ELSE 50 + (RANDOM() * 100)::INT  -- Random stock levels for other items
  END as current_stock,
  CASE 
    WHEN p.product_nm LIKE '%Cup%' THEN 200
    WHEN p.product_nm LIKE '%Napkins%' THEN 20
    ELSE 25
  END as min_stock_level
FROM public.location l
CROSS JOIN public.product p
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory i 
  WHERE i.location_id = l.location_id AND i.product_id = p.product_id
);

-- Insert sample inventory orders
INSERT INTO public.inventory_order (order_id, franchisee_id, location_id, order_date, status, total_amount, notes)
VALUES 
  (gen_random_uuid(), (SELECT franchisee_id FROM public.franchisee LIMIT 1), (SELECT location_id FROM public.location LIMIT 1), NOW() - INTERVAL '2 days', 'delivered', 2500.00, 'Weekly supply order'),
  (gen_random_uuid(), (SELECT franchisee_id FROM public.franchisee LIMIT 1), (SELECT location_id FROM public.location LIMIT 1), NOW() - INTERVAL '5 days', 'pending', 1800.00, 'Rush order for weekend'),
  (gen_random_uuid(), (SELECT franchisee_id FROM public.franchisee LIMIT 1), (SELECT location_id FROM public.location ORDER BY created_at DESC LIMIT 1), NOW() - INTERVAL '1 week', 'shipped', 3200.00, 'Monthly inventory restock')
ON CONFLICT (order_id) DO NOTHING;

-- Insert sample sales transactions
INSERT INTO public.sales_transaction (txn_id, location_id, txn_date, total_amt, status, payment_method)
VALUES 
  (gen_random_uuid(), (SELECT location_id FROM public.location LIMIT 1), NOW() - INTERVAL '1 hour', 450.00, 'completed', 'cash'),
  (gen_random_uuid(), (SELECT location_id FROM public.location LIMIT 1), NOW() - INTERVAL '2 hours', 320.00, 'completed', 'card'),
  (gen_random_uuid(), (SELECT location_id FROM public.location LIMIT 1), NOW() - INTERVAL '3 hours', 280.00, 'completed', 'card'),
  (gen_random_uuid(), (SELECT location_id FROM public.location ORDER BY created_at DESC LIMIT 1), NOW() - INTERVAL '1 day', 650.00, 'completed', 'cash'),
  (gen_random_uuid(), (SELECT location_id FROM public.location ORDER BY created_at DESC LIMIT 1), NOW() - INTERVAL '2 days', 390.00, 'completed', 'card')
ON CONFLICT (txn_id) DO NOTHING;