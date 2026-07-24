$regPath = "HKCU:\Software\SupportChat"
$propertyName = "InstallationId"

if (-not (Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

$installationId = (
    Get-ItemProperty `
        -Path $regPath `
        -Name $propertyName `
        -ErrorAction SilentlyContinue
).$propertyName

if ([string]::IsNullOrWhiteSpace($installationId)) {
    $installationId = [guid]::NewGuid().ToString()

    New-ItemProperty `
        -Path $regPath `
        -Name $propertyName `
        -Value $installationId `
        -PropertyType String `
        -Force | Out-Null
}

$computerName = $env:COMPUTERNAME
$domain = $env:USERDOMAIN
$windowsUser = $env:USERNAME

$params = [ordered]@{
    installationId = $installationId
    computerName = $computerName
    domain = $domain
    lastWindowsUser = $windowsUser
}

$query = (
    $params.GetEnumerator() |
    ForEach-Object {
        $name = $_.Key
        $value = [uri]::EscapeDataString([string]$_.Value)

        "$name=$value"
    }
) -join "&"

$url = "http://192.168.15.40:7001/?$query"

Write-Host ""
Write-Host "Ouverture du support :"
Write-Host "Poste      : $computerName"
Write-Host "Utilisateur: $domain\$windowsUser"
Write-Host "Identifiant: $installationId"
Write-Host ""

Start-Process $url
