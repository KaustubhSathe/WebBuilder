# DeepSeek API Test Script
$apiKey = "sk-61e47a0337c54f7491e15d0f085dbcaf" # Replace with your API key
$baseUrl = "https://api.deepseek.com/v1/chat/completions"

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $apiKey"
}

$body = @{
    model       = "deepseek-reasoner"
    messages    = @(
        @{
            role    = "system"
            content = "You are an expert JavaScript developer who writes clean, efficient code."
        }
        @{
            role    = "user"
            content = "Write a function that creates a slideshow with fade transitions"
        }
    )
    temperature = 0.7
    max_tokens  = 2000
} | ConvertTo-Json

Write-Host "Testing DeepSeek API..."
Write-Host "Sending request..."

try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
    Write-Host "Response received:"
    Write-Host ($response | ConvertTo-Json -Depth 10)
}
catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    Write-Host "Response:"
    Write-Host $_.ErrorDetails.Message
} 