[CmdletBinding()]
param(
    [string]$ImageName = 'contractease-backend:local',
    [string]$ContainerName = 'contractease-backend-smoke',
    [string]$EnvFile = (Join-Path (Get-Location) '.env'),
    [string]$OutputPdf = (Join-Path (Get-Location) 'docker-smoke-contract.pdf')
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Write-Step {
    param([string]$Message)
    Write-Host "[smoke] $Message"
}

function Remove-ContainerIfExists {
    param([Parameter(Mandatory = $true)][string]$Name)

    $existing = docker ps -aq -f "name=^/${Name}$"
    if ($existing) {
        docker rm -f $Name | Out-Null
    }
}

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)][ValidateSet('GET', 'POST', 'PUT')][string]$Method,
        [Parameter(Mandatory = $true)][string]$Uri,
        [object]$Body,
        [hashtable]$Headers = @{}
    )

    $invokeParams = @{
        Method      = $Method
        Uri         = $Uri
        Headers     = $Headers
        ContentType = 'application/json'
    }

    if ($null -ne $Body) {
        $invokeParams.Body = ($Body | ConvertTo-Json -Depth 12)
    }

    Invoke-RestMethod @invokeParams
}

try {
    if (-not (Test-Path $EnvFile)) {
        throw "Environment file not found: $EnvFile"
    }

    Write-Step "Removing any previous container named $ContainerName"
    Remove-ContainerIfExists -Name $ContainerName

    Write-Step "Starting container from $ImageName"
    $containerId = docker run -d --name $ContainerName -p 8000:8000 --env-file $EnvFile $ImageName
    if (-not $containerId) {
        throw 'Docker did not return a container ID'
    }

    Write-Step 'Waiting for backend health check'
    $health = $null
    for ($attempt = 1; $attempt -le 600; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -TimeoutSec 2
            if ($health.status -eq 'ok') {
                break
            }
        } catch {
        }

        Start-Sleep -Seconds 1
    }

    if (-not $health -or $health.status -ne 'ok') {
        Write-Step 'Backend logs before cleanup:'
        docker logs $ContainerName
        throw 'Backend did not become healthy in time'
    }

    Write-Step 'Logging in as seeded user and client'
    $userLogin = Invoke-JsonRequest -Method POST -Uri 'http://127.0.0.1:8000/login/user' -Body @{
        email    = 'alice@example.com'
        password = 'password123'
    }
    $clientLogin = Invoke-JsonRequest -Method POST -Uri 'http://127.0.0.1:8000/login/client' -Body @{
        email    = 'techcorp@example.com'
        password = 'password123'
    }

    $signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0L2Q0AAAAASUVORK5CYII='
    Write-Step 'Creating contract'
    $contract = Invoke-JsonRequest -Method POST -Uri 'http://127.0.0.1:8000/contracts/' -Headers @{ Authorization = "Bearer $($userLogin.access_token)" } -Body @{
        title           = 'Docker Smoke Test NDA'
        type            = 'nda'
        description     = 'Validation contract created by the Docker smoke test'
        amount          = 0
        currency        = '$'
        dueDate         = '2026-06-01T00:00:00Z'
        clauses         = @{ payment = $true; liability = $false; confidentiality = $true; termination = $false }
        userId          = $userLogin.user_id
        clientId        = $clientLogin.user_id
        creator_signature = $signatureData
        templateData    = @{
            nda = @{
                disclosingParty  = 'Alice Bennett'
                receivingParty   = 'TechCorp Ltd'
                purpose          = 'Product discovery and prototyping discussions'
                confidentialInfo = 'Confidential business and technical information'
                duration         = '2 years'
                effectiveDate    = '2026-05-14'
            }
        }
    }

    Write-Step "Contract created: $($contract._id)"

    Write-Step 'Sending contract'
    $sent = Invoke-JsonRequest -Method PUT -Uri "http://127.0.0.1:8000/contracts/$($contract._id)/send" -Headers @{ Authorization = "Bearer $($userLogin.access_token)" }

    Write-Step 'Signing contract'
    $signature = Invoke-JsonRequest -Method POST -Uri "http://127.0.0.1:8000/contracts/$($contract._id)/sign" -Headers @{ Authorization = "Bearer $($clientLogin.access_token)" } -Body @{
        signerName    = 'TechCorp Ltd'
        signerEmail   = 'techcorp@example.com'
        signatureImage = $signatureData
        signatureType = 'drawn'
    }

    Write-Step 'Checking persisted contract PDF URL'
    $updatedContract = Invoke-RestMethod -Uri "http://127.0.0.1:8000/contracts/$($contract._id)" -Headers @{ Authorization = "Bearer $($userLogin.access_token)" }
    if (-not $updatedContract.pdf_url) {
        throw 'Signed contract did not persist a pdf_url'
    }

    Write-Step 'Downloading signed PDF'
    Invoke-WebRequest -Method GET -Uri "http://127.0.0.1:8000/contracts/$($contract._id)/download" -Headers @{ Authorization = "Bearer $($clientLogin.access_token)" } -OutFile $OutputPdf | Out-Null
    $downloadBytes = (Get-Item $OutputPdf).Length
    if ($downloadBytes -le 0) {
        throw 'Downloaded PDF is empty'
    }

    Write-Host "[smoke] Success: health, login, create, send, sign, PDF generation, Cloudinary persistence, and download all passed."
    Write-Host "[smoke] Downloaded PDF bytes: $downloadBytes"

    if (Test-Path $OutputPdf) {
        Remove-Item -Force $OutputPdf
    }
}
finally {
    Remove-ContainerIfExists -Name $ContainerName
}