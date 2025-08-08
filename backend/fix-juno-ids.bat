@echo off
echo 🚨 CRITICAL PRODUCTION FIX - Updating Juno Bank Account IDs
echo ============================================================

echo.
echo 📝 Updating rodrigojille6@gmail.com with Juno ID: f221c81a-d7f4-4456-b4cb-7a78c9308104
heroku pg:psql -a kustodia-backend -c "UPDATE \"user\" SET juno_bank_account_id = 'f221c81a-d7f4-4456-b4cb-7a78c9308104' WHERE email = 'rodrigojille6@gmail.com';"

echo.
echo 📝 Updating rodrigo@kustodia.mx with Juno ID: e782bf90-75bb-455e-8c09-a8d2013dcfac
heroku pg:psql -a kustodia-backend -c "UPDATE \"user\" SET juno_bank_account_id = 'e782bf90-75bb-455e-8c09-a8d2013dcfac' WHERE email = 'rodrigo@kustodia.mx';"

echo.
echo 🔍 Verifying updates...
heroku pg:psql -a kustodia-backend -c "SELECT email, juno_bank_account_id, payout_clabe FROM \"user\" WHERE email IN ('rodrigojille6@gmail.com', 'rodrigo@kustodia.mx') ORDER BY email;"

echo.
echo 🔍 Checking Payment 121 seller...
heroku pg:psql -a kustodia-backend -c "SELECT p.id, u.email, u.juno_bank_account_id, u.payout_clabe FROM payment p JOIN \"user\" u ON p.seller_id = u.id WHERE p.id = 121;"

echo.
echo ✅ Updates completed! Payment 121 automation should now work.
