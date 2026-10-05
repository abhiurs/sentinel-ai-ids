#requires -Version 5.1

<#
.SYNOPSIS
    One-time Windows setup for the Sentinel AI IDS Local Sensor Agent.

.DESCRIPTION
    - Detects the Sentinel AI project root from the script location.
    - Verifies Python / virtual environment.
    - Creates .venv if missing.
    - Installs Python requirements when available.
    - Verifies Scapy and Npcap.
    - Configures backend\.env.
    - Registers the Local Sensor Agent in Windows Task Scheduler.
    - Starts the agent and verifies http://127.0.0.1:8765/.

.NOTES
    Run this script from an Administrator PowerShell window.
    Do NOT commit backend\.env to GitHub.
#>

[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$SkipStart
)

$ErrorActionPreference = "Stop"

# ============================================================
# CONFIGURATION
# ============================================================

$TaskName = "Sentinel AI Local Sensor Agent"
$AgentPort = 8765

$DefaultApiUrl = "https://sentinel-ai-ids-backend.onrender.com"

# IMPORTANT:
# The script is located directly inside the project root.
$ProjectRoot = $PSScriptRoot

$BackendDir = Join-Path $ProjectRoot "backend"
$ClientDir = Join-Path $ProjectRoot "client"

$AgentScript = Join-Path $BackendDir "ml\live\local_agent.py"

$VenvDir = Join-Path $ProjectRoot ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"

$EnvFile = Join-Path $BackendDir ".env"


# ============================================================
# HELPER FUNCTIONS
# ============================================================

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "[SETUP] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[ OK ] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    exit 1
}


function Test-Administrator {

    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()

    $principal = New-Object Security.Principal.WindowsPrincipal($identity)

    return $principal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator
    )
}


function Get-EnvValue(
    [string]$Path,
    [string]$Name
) {

    if (-not (Test-Path $Path)) {
        return $null
    }

    $escapedName = [regex]::Escape($Name)

    $line = Get-Content $Path -ErrorAction SilentlyContinue |
        Where-Object {
            $_ -match "^\s*$escapedName\s*="
        } |
        Select-Object -First 1

    if (-not $line) {
        return $null
    }

    return (($line -split "=", 2)[1]).Trim()
}


function Set-EnvValue(
    [string]$Path,
    [string]$Name,
    [string]$Value
) {

    $lines = @()

    if (Test-Path $Path) {
        $lines = @(Get-Content $Path)
    }

    $escapedName = [regex]::Escape($Name)

    $found = $false

    $newLines = foreach ($line in $lines) {

        if ($line -match "^\s*$escapedName\s*=") {

            $found = $true

            "$Name=$Value"

        }
        else {

            $line
        }
    }

    if (-not $found) {

        if ($newLines.Count -gt 0 -and $newLines[-1] -ne "") {
            $newLines += ""
        }

        $newLines += "$Name=$Value"
    }

    Set-Content `
        -Path $Path `
        -Value $newLines `
        -Encoding UTF8
}


function Read-Secret([string]$Prompt) {

    $secure = Read-Host `
        -Prompt $Prompt `
        -AsSecureString

    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)

    try {

        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)

    }
    finally {

        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}


# ============================================================
# HEADER
# ============================================================

Write-Host ""

Write-Host "============================================================" `
    -ForegroundColor Cyan

Write-Host " SENTINEL AI IDS - LOCAL SENSOR SETUP" `
    -ForegroundColor Cyan

Write-Host "============================================================" `
    -ForegroundColor Cyan

Write-Host ""

Write-Host "Project : $ProjectRoot"
Write-Host "Backend : $BackendDir"
Write-Host "Agent   : $AgentScript"
Write-Host "Task    : $TaskName"

Write-Host ""


# ============================================================
# ADMINISTRATOR CHECK
# ============================================================

if (-not (Test-Administrator)) {

    Fail `
        "Please open PowerShell as Administrator and run this script again."
}


# ============================================================
# PROJECT STRUCTURE CHECK
# ============================================================

Write-Step "Checking Sentinel AI project structure"

if (-not (Test-Path $BackendDir)) {

    Fail `
        "backend folder was not found. Make sure this script is inside the Sentinel AI project root."
}


if (-not (Test-Path $ClientDir)) {

    Fail `
        "client folder was not found. Make sure this script is inside the Sentinel AI project root."
}


if (-not (Test-Path $AgentScript)) {

    Fail `
        "local_agent.py was not found at:`n$AgentScript"
}


Write-Ok "Sentinel AI project structure found."


# ============================================================
# PYTHON / VIRTUAL ENVIRONMENT
# ============================================================

Write-Step "Checking Python environment"

if (-not (Test-Path $PythonExe)) {

    Write-Warn ".venv was not found."

    Write-Host "Creating Python virtual environment..."

    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue

    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue


    if ($pyLauncher) {

        & py -3 -m venv $VenvDir

    }
    elseif ($pythonCmd) {

        & python -m venv $VenvDir

    }
    else {

        Fail `
            "Python 3 was not found. Install Python 3 and run this script again."
    }


    if (
        $LASTEXITCODE -ne 0 -or
        -not (Test-Path $PythonExe)
    ) {

        Fail `
            "Could not create the Python virtual environment."
    }
}


Write-Ok "Python virtual environment found."

Write-Host $PythonExe


# ============================================================
# PYTHON DEPENDENCIES
# ============================================================

if (-not $SkipInstall) {

    $requirementsCandidates = @(

        (Join-Path $ProjectRoot "requirements.txt"),

        (Join-Path $BackendDir "requirements.txt")

    )


    $requirements = $requirementsCandidates |
        Where-Object {
            Test-Path $_
        } |
        Select-Object -First 1


    if ($requirements) {

        Write-Step "Installing Python dependencies"

        Write-Host "Requirements:"
        Write-Host $requirements


        & $PythonExe -m pip install --upgrade pip

        if ($LASTEXITCODE -ne 0) {

            Fail "pip upgrade failed."
        }


        & $PythonExe -m pip install -r $requirements

        if ($LASTEXITCODE -ne 0) {

            Fail "Python dependency installation failed."
        }


        Write-Ok "Python dependencies installed."

    }
    else {

        Write-Warn `
            "No requirements.txt was found. Skipping dependency installation."
    }
}


# ============================================================
# SCAPY CHECK
# ============================================================

Write-Step "Checking Scapy"

& $PythonExe -c `
    "import scapy; print(scapy.__version__)" `
    2>$null


if ($LASTEXITCODE -ne 0) {

    Fail `
        "Scapy is not installed in the project virtual environment."
}


Write-Ok "Scapy is available."


# ============================================================
# NPCAP CHECK
# ============================================================

Write-Step "Checking Npcap"

$npcapPaths = @(

    "$env:WINDIR\System32\wpcap.dll",

    "$env:WINDIR\System32\Npcap\wpcap.dll",

    "$env:WINDIR\SysWOW64\wpcap.dll"

)


$npcapFound = $npcapPaths |
    Where-Object {
        Test-Path $_
    } |
    Select-Object -First 1


if ($npcapFound) {

    Write-Ok `
        "Npcap/WinPcap-compatible capture library found: $npcapFound"

}
else {

    Write-Warn "Npcap was not detected."

    Write-Warn `
        "Install Npcap with WinPcap API-compatible support."

    Write-Warn `
        "After installing Npcap, reboot if required and run this script again."
}


# ============================================================
# BACKEND .ENV
# ============================================================

Write-Step "Configuring local sensor environment"

if (-not (Test-Path $EnvFile)) {

    New-Item `
        -ItemType File `
        -Path $EnvFile `
        -Force |
        Out-Null

    Write-Warn `
        "backend\.env did not exist. A new file will be created."
}


# ============================================================
# LIVE SENSOR API URL
# ============================================================

$currentApiUrl = Get-EnvValue `
    $EnvFile `
    "LIVE_SENSOR_API_URL"


if ([string]::IsNullOrWhiteSpace($currentApiUrl)) {

    $apiInput = Read-Host `
        "Render backend URL [$DefaultApiUrl]"


    if ([string]::IsNullOrWhiteSpace($apiInput)) {

        $apiInput = $DefaultApiUrl
    }


    Set-EnvValue `
        $EnvFile `
        "LIVE_SENSOR_API_URL" `
        $apiInput


    $currentApiUrl = $apiInput

}
else {

    Write-Host ""

    Write-Host `
        "Existing LIVE_SENSOR_API_URL found: $currentApiUrl" `
        -ForegroundColor Yellow


    $changeUrl = Read-Host `
        "Keep this URL? [Y/n]"


    if ($changeUrl -match "^[Nn]") {

        $apiInput = Read-Host `
            "Enter Render backend URL"


        if ([string]::IsNullOrWhiteSpace($apiInput)) {

            Fail "A backend URL is required."
        }


        Set-EnvValue `
            $EnvFile `
            "LIVE_SENSOR_API_URL" `
            $apiInput


        $currentApiUrl = $apiInput
    }
}


# ============================================================
# LIVE SENSOR KEY
# ============================================================

$currentSensorKey = Get-EnvValue `
    $EnvFile `
    "LIVE_SENSOR_KEY"


if ([string]::IsNullOrWhiteSpace($currentSensorKey)) {

    Write-Host ""

    Write-Host `
        "LIVE_SENSOR_KEY is not present in backend\.env."


    $sensorKey = Read-Secret `
        "Enter LIVE_SENSOR_KEY"


    if ([string]::IsNullOrWhiteSpace($sensorKey)) {

        Fail `
            "LIVE_SENSOR_KEY cannot be empty."
    }


    Set-EnvValue `
        $EnvFile `
        "LIVE_SENSOR_KEY" `
        $sensorKey


    $currentSensorKey = $sensorKey

}
else {

    Write-Ok `
        "Existing LIVE_SENSOR_KEY found; keeping it."
}


Write-Ok `
    "Local sensor environment configured."

Write-Host ""

Write-Host "Backend target:"
Write-Host $currentApiUrl


# ============================================================
# GIT SAFETY CHECK
# ============================================================

Write-Step "Checking Git safety"

$gitignore = Join-Path `
    $ProjectRoot `
    ".gitignore"


if (Test-Path $gitignore) {

    $ignored = Select-String `
        -Path $gitignore `
        -Pattern '(^|/|\\)\.env($|/|\\)|\.env' `
        -Quiet


    if ($ignored) {

        Write-Ok `
            ".env is covered by .gitignore."

    }
    else {

        Write-Warn `
            ".gitignore does not clearly contain an .env rule."

        Write-Warn `
            "DO NOT commit backend\.env."
    }

}
else {

    Write-Warn `
        ".gitignore was not found."

    Write-Warn `
        "DO NOT commit backend\.env."
}


# ============================================================
# TASK SCHEDULER
# ============================================================

Write-Step "Registering Windows Task Scheduler task"


$taskAction = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$AgentScript`"" `
    -WorkingDirectory $ProjectRoot


$taskTrigger = New-ScheduledTaskTrigger `
    -AtLogOn `
    -User $env:USERNAME


$taskPrincipal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest


$taskSettings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries


$existingTask = Get-ScheduledTask `
    -TaskName $TaskName `
    -ErrorAction SilentlyContinue


if ($existingTask) {

    Write-Host `
        "Existing task found. Replacing it..."

    Unregister-ScheduledTask `
        -TaskName $TaskName `
        -Confirm:$false

    Write-Ok `
        "Existing sensor task removed."
}


Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $taskAction `
    -Trigger $taskTrigger `
    -Principal $taskPrincipal `
    -Settings $taskSettings `
    -Description `
        "Starts the Sentinel AI IDS Local Sensor Agent at Windows logon." |
    Out-Null


Write-Ok `
    "Task Scheduler task registered."


# ============================================================
# START AGENT
# ============================================================

if (-not $SkipStart) {

    Write-Step "Starting Local Sensor Agent"


    Start-ScheduledTask `
        -TaskName $TaskName


    Start-Sleep `
        -Seconds 3


    $task = Get-ScheduledTask `
        -TaskName $TaskName


    if ($task.State -eq "Running") {

        Write-Ok `
            "Local Sensor Agent task is running."

    }
    else {

        Write-Warn `
            "Task state is '$($task.State)'."

        Write-Warn `
            "Check Windows Task Scheduler if it did not start."
    }


    # ========================================================
    # VERIFY LOCAL AGENT
    # ========================================================

    Write-Step "Verifying local agent endpoint"


    try {

        $response = Invoke-RestMethod `
            -Uri "http://127.0.0.1:$AgentPort/" `
            -Method Get `
            -TimeoutSec 5


        if ($response.status -eq "Running") {

            Write-Ok `
                "Local Sensor Agent is reachable."

            Write-Host `
                "http://127.0.0.1:$AgentPort/"

        }
        else {

            Write-Warn `
                "Agent responded, but status was not 'Running'."
        }

    }
    catch {

        Write-Warn `
            "Could not reach http://127.0.0.1:$AgentPort/ yet."

        Write-Warn `
            "The agent may still be starting."

        Write-Warn `
            "Wait a few seconds and try the URL manually."
    }
}


# ============================================================
# COMPLETION
# ============================================================

Write-Host ""

Write-Host "============================================================" `
    -ForegroundColor Green

Write-Host " SENSOR SETUP COMPLETE" `
    -ForegroundColor Green

Write-Host "============================================================" `
    -ForegroundColor Green

Write-Host ""

Write-Host "Project   : $ProjectRoot"
Write-Host "Task      : $TaskName"
Write-Host "Agent URL : http://127.0.0.1:$AgentPort/"
Write-Host "Backend   : $currentApiUrl"

Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan

Write-Host "  1. Open Sentinel AI in your browser."
Write-Host "  2. Go to Live Monitoring."
Write-Host "  3. Switch Demo -> Live."
Write-Host "  4. Confirm packets/detections appear."

Write-Host ""

Write-Host `
    "IMPORTANT: backend\.env contains secrets. Never commit it to GitHub." `
    -ForegroundColor Yellow

Write-Host ""