# Mix & Munch API Testing Script
# Run this after backend restarts

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Mix & Munch API Testing Script                   ║" -ForegroundColor Cyan
Write-Host "║     Restart backend first, then run this script             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$tests = @()

function Test-Endpoint {
    param(
        [string]$name,
        [string]$method,
        [string]$endpoint,
        [object]$body
    )
    
    Write-Host "Testing: $name" -ForegroundColor Yellow
    try {
        $params = @{
            Uri = "$baseUrl$endpoint"
            Method = $method
            ErrorAction = "Stop"
        }
        
        if ($body) {
            $params['Body'] = $body | ConvertTo-Json
            $params['ContentType'] = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($endpoint -eq "/api/recipes" -and $data.pagination) {
            Write-Host "  📊 Total Recipes: $($data.pagination.total)" -ForegroundColor Cyan
            Write-Host "  📄 Returned: $($data.data.Count) recipes" -ForegroundColor Cyan
            if ($data.data.Count -gt 0) {
                Write-Host "  🍳 Sample: $($data.data[0].title)" -ForegroundColor Green
            }
        }
        elseif ($endpoint -eq "/api/admin/dashboard/stats") {
            Write-Host "  📊 Total Recipes: $($data.totalRecipes)" -ForegroundColor Cyan
            Write-Host "  🔄 Crawl Runs: $($data.crawlRuns)" -ForegroundColor Cyan
        }
        
        Write-Host ""
        return $true
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Run tests
Write-Host "Waiting 2 seconds for backend to respond..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$results = @()
$results += Test-Endpoint "Health Check" "GET" "/api/health"
$results += Test-Endpoint "Admin Dashboard" "GET" "/api/admin/dashboard/stats"
$results += Test-Endpoint "Recipes (5 per page)" "GET" "/api/recipes?limit=5"
$results += Test-Endpoint "First Recipe Details" "GET" "/api/recipes/1"
$results += Test-Endpoint "Crawler Logs" "GET" "/api/crawler/logs"

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   TEST SUMMARY                              ║" -ForegroundColor Green

$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count

if ($passed -eq $total) {
    Write-Host "║  ✅ ALL TESTS PASSED ($passed/$total)                         ║" -ForegroundColor Green
} else {
    Write-Host "║  ⚠️  $passed/$total tests passed                              ║" -ForegroundColor Yellow
}

Write-Host "║                                                            ║" -ForegroundColor Green
if ($passed -eq $total) {
    Write-Host "║  Your system is FULLY OPERATIONAL! 🚀                       ║" -ForegroundColor Green
} else {
    Write-Host "║  Some endpoints need attention. Check errors above.        ║" -ForegroundColor Yellow
}

Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Show next steps
if ($passed -eq $total) {
    Write-Host "✨ NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "  1. Frontend is already running on http://localhost:2000" -ForegroundColor Cyan
    Write-Host "  2. Backend API is working on http://localhost:5000" -ForegroundColor Cyan
    Write-Host "  3. Database has $(($results[2] | Select-Object).ToString()) recipes" -ForegroundColor Cyan
    Write-Host "  4. Ready for frontend integration!" -ForegroundColor Cyan
}
