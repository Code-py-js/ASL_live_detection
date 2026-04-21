# Test backend endpoints (PowerShell)

$base = 'http://localhost:4000'

Write-Host 'Testing health endpoint...'
$health = Invoke-RestMethod -Uri "$base/api/health" -Method Get
Write-Host "Health: $($health | ConvertTo-Json)"

Write-Host 'Testing register endpoint...'
$registerBody = @{ email = 'test@example.com'; password = 'Password123' }
$register = Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -Body ($registerBody | ConvertTo-Json) -ContentType 'application/json'
Write-Host "Register response: $($register | ConvertTo-Json)"

Write-Host 'Testing login endpoint...'
$loginBody = @{ email = 'test@example.com'; password = 'Password123' }
$login = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType 'application/json'
Write-Host "Login response: $($login | ConvertTo-Json)"

if ($login -and $login.token) {
  $token = $login.token
  Write-Host 'Testing translations endpoint (create)...'
  $translationBody = @{ inputText = 'hello'; outputText = 'bonjour'; confidence = 0.95 }
  $translation = Invoke-RestMethod -Uri "$base/api/translations" -Method Post -Body ($translationBody | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" }
  Write-Host "Translation create response: $($translation | ConvertTo-Json)"

  Write-Host 'Testing translations endpoint (list)...'
  $translations = Invoke-RestMethod -Uri "$base/api/translations" -Method Get -Headers @{ Authorization = "Bearer $token" }
  Write-Host "Translations list: $($translations | ConvertTo-Json)"
} else {
  Write-Host 'Login failed; cannot test translations.'
}
