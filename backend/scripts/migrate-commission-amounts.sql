-- Commission Amount Migration for Production Database
-- Run this script on Heroku PostgreSQL to populate commission amounts

-- Update existing payment requests with commission amounts based on flow type
-- This assumes commission percentages are stored as environment variables

-- Traditional Flow (1.0%)
UPDATE payment_requests 
SET commission_amount = ROUND((amount * 1.0 / 100)::numeric, 2)
WHERE flow_type = 'traditional' 
  AND commission_amount IS NULL 
  AND amount IS NOT NULL;

-- Nuevo Flujo (2.0%)
UPDATE payment_requests 
SET commission_amount = ROUND((amount * 2.0 / 100)::numeric, 2)
WHERE flow_type = 'nuevo_flujo' 
  AND commission_amount IS NULL 
  AND amount IS NOT NULL;

-- Cobro Inteligente - Autos, Inmobiliaria, Otros (1.5%)
UPDATE payment_requests 
SET commission_amount = ROUND((amount * 1.5 / 100)::numeric, 2)
WHERE flow_type IN ('cobro_autos', 'cobro_inmobiliaria', 'cobro_otros')
  AND commission_amount IS NULL 
  AND amount IS NOT NULL;

-- Fallback: Any remaining records without commission_amount (0%)
UPDATE payment_requests 
SET commission_amount = 0
WHERE commission_amount IS NULL;

-- Verification queries
SELECT 
  flow_type,
  COUNT(*) as total_records,
  AVG(commission_amount) as avg_commission,
  SUM(commission_amount) as total_commission
FROM payment_requests 
WHERE commission_amount IS NOT NULL
GROUP BY flow_type
ORDER BY flow_type;

-- Check for any remaining NULL commission amounts
SELECT COUNT(*) as null_commission_count 
FROM payment_requests 
WHERE commission_amount IS NULL;
