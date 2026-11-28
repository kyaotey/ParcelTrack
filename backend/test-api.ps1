# ParcelTrack API smoke test
$body = @{ email = 'admin@parceltrack.dev'; password = 'admin123' } | ConvertTo-Json
$response = Invoke-RestMethod -Method POST -Uri http://localhost:5000/api/auth/login -ContentType 'application/json' -Body $body
$token = $response.data.token
Write-Host "Login OK — token length: $($token.Length)"

$headers = @{ Authorization = "Bearer $token" }
$parcels = Invoke-RestMethod -Method GET -Uri http://localhost:5000/api/parcels -Headers $headers
Write-Host "Parcels OK — count: $($parcels.data.count)"
$parcels.data.parcels | Select-Object trackingNumber, status | Format-Table
