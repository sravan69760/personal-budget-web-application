param(
  [string]$Message = "Update personal budget app"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed or is not on PATH."
  Write-Host "Install Git for Windows from https://git-scm.com/download/win, then open a new PowerShell window."
  exit 1
}

$RepoUrl = "https://github.com/sravan69760/personal-budget-web-application.git"

function Invoke-Git {
  git @args
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $args"
  }
}

if (-not (Test-Path ".git")) {
  Invoke-Git init
  Invoke-Git branch -M main
}

$remote = ""
try {
  $remote = git remote get-url origin 2>$null
} catch {
  $remote = ""
}

if ([string]::IsNullOrWhiteSpace($remote)) {
  Invoke-Git remote add origin $RepoUrl
} elseif ($remote -ne $RepoUrl) {
  Invoke-Git remote set-url origin $RepoUrl
}

Invoke-Git add .

$status = git status --porcelain
if (-not $status) {
  Write-Host "No changes to commit."
  exit 0
}

Invoke-Git commit -m $Message
Invoke-Git pull --rebase --autostash --allow-unrelated-histories origin main
Invoke-Git push -u origin main

Write-Host "Pushed latest code to $RepoUrl"
