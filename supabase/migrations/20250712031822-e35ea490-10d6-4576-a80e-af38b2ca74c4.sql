-- Insert inventory data for existing locations
INSERT INTO public.inventory (inventory_id, location_id, product_id, current_stock, min_stock_level) 
SELECT 
    gen_random_uuid(),
    l.location_id,
    p.product_id,
    CASE 
        WHEN p.product_nm LIKE '%Burger%' THEN 45 + (RANDOM() * 30)::INTEGER
        WHEN p.product_nm LIKE '%Pizza%' THEN 25 + (RANDOM() * 20)::INTEGER  
        WHEN p.product_nm LIKE '%Coffee%' THEN 80 + (RANDOM() * 40)::INTEGER
        WHEN p.product_nm LIKE '%Fries%' THEN 60 + (RANDOM() * 25)::INTEGER
        ELSE 35 + (RANDOM() * 20)::INTEGER
    END,
    CASE 
        WHEN p.product_nm LIKE '%Burger%' THEN 15
        WHEN p.product_nm LIKE '%Pizza%' THEN 10
        WHEN p.product_nm LIKE '%Coffee%' THEN 30
        WHEN p.product_nm LIKE '%Fries%' THEN 20
        ELSE 10
    END
FROM public.location l
CROSS JOIN public.product p
WHERE p.brand_id IN (
    SELECT fr.brand_id 
    FROM public.franchisee fr 
    WHERE fr.franchisee_id = l.franchisee_id
)
LIMIT 200;

-- Insert some sample sales transactions for existing locations (using simpler approach)
INSERT INTO public.sales_transaction (txn_id, location_id, txn_date, total_amt, status, payment_method, metadata) 
SELECT 
    gen_random_uuid(),
    l.location_id,
    CURRENT_DATE - (RANDOM() * 30)::INTEGER - (RANDOM() * interval '24 hours'),
    15.00 + (RANDOM() * 50)::NUMERIC(10,2),
    'completed',
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'credit_card'
        WHEN 1 THEN 'cash'
        ELSE 'debit_card'
    END,
    jsonb_build_object(
        'order_type', 
        CASE (RANDOM() * 3)::INTEGER
            WHEN 0 THEN 'dine_in'
            WHEN 1 THEN 'takeout'
            ELSE 'delivery'
        END
    )
FROM public.location l
CROSS JOIN generate_series(1, 15) -- 15 transactions per location
LIMIT 150;

-- Insert sample user profiles for the franchisor
INSERT INTO public.user_profiles (user_id, franchisor_id, first_nm, last_nm, phone_no, status, metadata, preferences)
SELECT 
    gen_random_uuid(),
    f.franchisor_id,
    CASE (RANDOM() * 10)::INTEGER
        WHEN 0 THEN 'John'
        WHEN 1 THEN 'Sarah'
        WHEN 2 THEN 'Michael'
        WHEN 3 THEN 'Lisa'
        WHEN 4 THEN 'David'
        WHEN 5 THEN 'Emily'
        WHEN 6 THEN 'Robert'
        WHEN 7 THEN 'Jessica'
        WHEN 8 THEN 'Daniel'
        ELSE 'Amanda'
    END,
    CASE (RANDOM() * 10)::INTEGER
        WHEN 0 THEN 'Smith'
        WHEN 1 THEN 'Johnson'
        WHEN 2 THEN 'Williams'
        WHEN 3 THEN 'Brown'
        WHEN 4 THEN 'Jones'
        WHEN 5 THEN 'Garcia'
        WHEN 6 THEN 'Miller'
        WHEN 7 THEN 'Davis'
        WHEN 8 THEN 'Rodriguez'
        ELSE 'Wilson'
    END,
    '+1-555-' || LPAD((1000 + (RANDOM() * 9000)::INTEGER)::TEXT, 4, '0'),
    'active',
    jsonb_build_object(
        'role', CASE (RANDOM() * 3)::INTEGER
            WHEN 0 THEN 'admin'
            WHEN 1 THEN 'manager'
            ELSE 'staff'
        END,
        'hire_date', CURRENT_DATE - (RANDOM() * 365)::INTEGER
    ),
    jsonb_build_object(
        'notifications', true,
        'theme', 'light'
    )
FROM public.franchisor f
CROSS JOIN generate_series(1, 25) -- 25 users
LIMIT 25;