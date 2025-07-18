-- Update franchise locations with realistic performance tiers
-- This creates diverse performance scenarios for business analytics

UPDATE franchise_locations SET
  status = 'open',
  opening_date = CASE 
    WHEN name LIKE '%Ermita%' THEN '2023-01-15'::date
    WHEN name LIKE '%Makati%' THEN '2022-08-20'::date
    WHEN name LIKE '%BGC%' THEN '2023-03-10'::date
    WHEN name LIKE '%Quezon City%' THEN '2022-11-05'::date
    WHEN name LIKE '%Cebu%' THEN '2023-02-28'::date
    ELSE '2023-01-01'::date
  END,
  monthly_target = CASE 
    -- High Performers (₱300K-500K targets)
    WHEN name LIKE '%BGC%' OR name LIKE '%Makati%' THEN 450000
    WHEN name LIKE '%Ortigas%' OR name LIKE '%Alabang%' THEN 380000
    -- Average Performers (₱150K-250K targets)
    WHEN name LIKE '%Quezon City%' OR name LIKE '%Pasig%' THEN 200000
    WHEN name LIKE '%Cebu%' OR name LIKE '%Davao%' THEN 180000
    WHEN name LIKE '%Ermita%' OR name LIKE '%Taguig%' THEN 160000
    -- Low Performers (₱80K-120K targets)
    WHEN name LIKE '%Baguio%' OR name LIKE '%Iloilo%' THEN 100000
    WHEN name LIKE '%Muntinlupa%' OR name LIKE '%Pasay%' THEN 90000
    -- Struggling Locations (₱40K-60K targets)
    ELSE 50000
  END;

-- Verify franchise performance tiers
SELECT 
  'Franchise Performance Tiers' as status,
  COUNT(CASE WHEN monthly_target >= 400000 THEN 1 END) as high_performers,
  COUNT(CASE WHEN monthly_target >= 150000 AND monthly_target < 400000 THEN 1 END) as average_performers,
  COUNT(CASE WHEN monthly_target >= 80000 AND monthly_target < 150000 THEN 1 END) as low_performers,
  COUNT(CASE WHEN monthly_target < 80000 THEN 1 END) as struggling_locations
FROM franchise_locations 
WHERE status = 'open';
