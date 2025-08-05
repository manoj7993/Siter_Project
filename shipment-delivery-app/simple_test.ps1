Write-Host "API Testing Script" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
Write-Host "✅ Health: $($health.message)"

# Test 2: API Documentation  
Write-Host "`n2. Testing API Documentation..." -ForegroundColor Yellow
$api = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
Write-Host "✅ API Name: $($api.name)"

# Test 3: Login
Write-Host "`n3. Testing Login..." -ForegroundColor Yellow
$loginBody = '{"email":"test456@test.com","password":"Test123!"}'
$login = Invoke-RestMethod -Uri "http://localhost:5000/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host "✅ Login: $($login.message)"
$token = $login.token

# Test 4: Settings Countries
Write-Host "`n4. Testing Settings Countries..." -ForegroundColor Yellow
$countries = Invoke-RestMethod -Uri "http://localhost:5000/settings/countries" -Method GET
Write-Host "✅ Countries: $($countries.countries.Count) found"

Write-Host "`n🏁 Basic API tests completed!" -ForegroundColor Green
