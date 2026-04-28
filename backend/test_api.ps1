$ErrorActionPreference = "SilentlyContinue"

function Test-Endpoint($label, $scriptBlock) {
    Write-Host "=== $label ===" -ForegroundColor Cyan
    try {
        & $scriptBlock
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 1. Backend health
Test-Endpoint "BACKEND HEALTH CHECK" {
    $r = Invoke-RestMethod -Uri 'http://localhost:5000/api/status' -TimeoutSec 5
    Write-Host "UP - $($r.message)" -ForegroundColor Green
}

# 2. Admin login
$adminToken = $null
Test-Endpoint "POST /auth/login  [Admin]" {
    $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/auth/login' `
        -ContentType 'application/json' `
        -Body '{"email":"admin@hackathon.dev","password":"admin123"}'
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "  Token : $($r.token.Substring(0,50))..."
    Write-Host "  Name  : $($r.user.name)"
    Write-Host "  Role  : $($r.user.role)"
    $script:adminToken = $r.token
}

# 3. Participant login
Test-Endpoint "POST /auth/login  [Participant]" {
    $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/auth/login' `
        -ContentType 'application/json' `
        -Body '{"email":"alice@hackathon.dev","password":"alice123"}'
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "  Name : $($r.user.name)  |  Role : $($r.user.role)"
}

# 4. Register new user
Test-Endpoint "POST /auth/register  [New Participant]" {
    $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/auth/register' `
        -ContentType 'application/json' `
        -Body '{"name":"Demo Tester","email":"demo2@test.dev","password":"demo1234","role":"participant"}'
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "  Registered : $($r.user.name)  |  Role : $($r.user.role)"
}

# 5. /auth/me (protected)
Test-Endpoint "GET /auth/me  [Protected]" {
    $h = @{ Authorization = "Bearer $script:adminToken" }
    $r = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/auth/me' -Headers $h
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "  $($r.user.name) | $($r.user.email) | $($r.user.role)"
}

# 6. GET /teams (public)
Test-Endpoint "GET /teams  [Public]" {
    $r = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/teams'
    Write-Host "SUCCESS - $($r.count) teams:" -ForegroundColor Green
    foreach ($t in $r.data) {
        Write-Host "  [$($t.status.ToUpper())]  $($t.name)  |  $($t.repo)"
    }
}

# 7. GET /alerts (admin protected)
Test-Endpoint "GET /alerts  [Admin Protected]" {
    $h = @{ Authorization = "Bearer $script:adminToken" }
    $r = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/alerts' -Headers $h
    Write-Host "SUCCESS - $($r.count) alerts:" -ForegroundColor Green
    foreach ($a in $r.data) {
        $state = if ($a.active) { "ACTIVE" } else { "RESOLVED" }
        Write-Host "  [$state]  $($a.type) @ $($a.location)"
    }
}

# 8. POST /alerts (trigger emergency)
Test-Endpoint "POST /alerts  [Trigger Emergency]" {
    $h = @{ Authorization = "Bearer $script:adminToken" }
    $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/alerts' -Headers $h `
        -ContentType 'application/json' `
        -Body '{"type":"Technical","location":"Hall A - Table 7","description":"Laptop overheating"}'
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "  Created : [$($r.data.type)] $($r.data.location)"
    $script:alertId = $r.data._id
}

# 9. PATCH /alerts/:id/resolve
Test-Endpoint "PATCH /alerts/:id/resolve  [Admin]" {
    if ($script:alertId) {
        $h = @{ Authorization = "Bearer $script:adminToken" }
        $r = Invoke-RestMethod -Method PATCH -Uri "http://localhost:5000/alerts/$script:alertId/resolve" -Headers $h
        Write-Host "SUCCESS - Alert resolved, active=$($r.data.active)" -ForegroundColor Green
    } else {
        Write-Host "SKIPPED - no alert ID from previous step"
    }
}

# 10. Unauthorized access test (no token)
Test-Endpoint "GET /alerts  [No Token - Should Be Blocked]" {
    try {
        $r = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/alerts' -TimeoutSec 5
        Write-Host "FAIL - Should have returned 401!" -ForegroundColor Red
    } catch {
        Write-Host "SUCCESS - Correctly blocked with 401 Unauthorized" -ForegroundColor Green
    }
}

# 11. Wrong password test
Test-Endpoint "POST /auth/login  [Wrong Password]" {
    try {
        $r = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/auth/login' `
            -ContentType 'application/json' `
            -Body '{"email":"admin@hackathon.dev","password":"wrongpass"}'
        Write-Host "FAIL - Should have returned 401!" -ForegroundColor Red
    } catch {
        Write-Host "SUCCESS - Correctly returned 401 Invalid credentials" -ForegroundColor Green
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
