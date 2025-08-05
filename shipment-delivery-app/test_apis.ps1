# Comprehensive API Testing Script
Write-Host "🚀 Starting Comprehensive API Testing..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testResults = @()

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Name,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        Write-Host "`n🔍 Testing: $Name" -ForegroundColor Yellow
        Write-Host "   $Method $Url" -ForegroundColor Gray
        
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
        
        return @{
            Name = $Name
            Status = "SUCCESS"
            Response = $response
        }
    }
    catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Name = $Name
            Status = "FAILED"
            Error = $_.Exception.Message
        }
    }
}

# 1. Test Health Check
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/health" -Name "Health Check"
$testResults += $result

# 2. Test API Documentation
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api" -Name "API Documentation"
$testResults += $result

# 3. Test Registration
$registerBody = @{
    firstName = "TestUser"
    lastName = "APITest"
    email = "apitest@test.com"
    password = "Test123!"
    countryId = "cmdydqrhu0006xzwtga8vt7rh"
} | ConvertTo-Json

$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/register" -Name "User Registration" -Body $registerBody
$testResults += $result

# 4. Test Login
$loginBody = @{
    email = "test456@test.com"
    password = "Test123!"
} | ConvertTo-Json

$loginResult = Test-Endpoint -Method "POST" -Url "$baseUrl/login" -Name "User Login" -Body $loginBody
$testResults += $loginResult

# Get token for authenticated requests
$token = $null
if ($loginResult.Status -eq "SUCCESS" -and $loginResult.Response.token) {
    $token = $loginResult.Response.token
    Write-Host "   🔑 Token obtained for authenticated requests" -ForegroundColor Blue
}

# 5. Test Settings Countries (Public)
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/settings/countries" -Name "Settings Countries"
$testResults += $result

# 6. Test Account endpoints (requires auth)
if ($token) {
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }
    
    # Try to get account info
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/account/test456@test.com" -Name "Get Account Info" -Headers $authHeaders
    $testResults += $result
    
    # Test Dashboard User
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/dashboard/user" -Name "User Dashboard" -Headers $authHeaders
    $testResults += $result
    
    # Test Shipments List
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/shipments" -Name "List Shipments" -Headers $authHeaders
    $testResults += $result
}

# Display Results Summary
Write-Host "`n📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$successCount = ($testResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $($totalCount - $successCount)" -ForegroundColor Red

Write-Host "`n📋 Detailed Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $status = if ($result.Status -eq "SUCCESS") { "✅" } else { "❌" }
    Write-Host "   $status $($result.Name)" -ForegroundColor $(if ($result.Status -eq "SUCCESS") { "Green" } else { "Red" })
    if ($result.Status -eq "FAILED") {
        Write-Host "      Error: $($result.Error)" -ForegroundColor Gray
    }
}

Write-Host "`n🏁 API Testing Complete!" -ForegroundColor Cyan
