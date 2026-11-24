Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = "c:\Users\THATIPALLY VINOD\OneDrive\Desktop\Ayyappa"
$apiDir = Join-Path $root "apps\api"

# 1. cPanel deploy package (dist + prisma + uploads + configs)
$cpanelZip = Join-Path $root "api-cpanel-deploy.zip"
if (Test-Path $cpanelZip) { Remove-Item -Force $cpanelZip }
$tempCpanel = Join-Path ([System.IO.Path]::GetTempPath()) ("cpanel_deploy_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempCpanel | Out-Null

Copy-Item -Recurse (Join-Path $apiDir "dist") (Join-Path $tempCpanel "dist")
Copy-Item -Recurse (Join-Path $apiDir "prisma") (Join-Path $tempCpanel "prisma")
if (Test-Path (Join-Path $apiDir "uploads")) {
    Copy-Item -Recurse (Join-Path $apiDir "uploads") (Join-Path $tempCpanel "uploads")
}
Copy-Item (Join-Path $apiDir "package.json") (Join-Path $tempCpanel "package.json")
if (Test-Path (Join-Path $apiDir "app.js")) {
    Copy-Item (Join-Path $apiDir "app.js") (Join-Path $tempCpanel "app.js")
}
if (Test-Path (Join-Path $apiDir ".env.production")) {
    Copy-Item (Join-Path $apiDir ".env.production") (Join-Path $tempCpanel ".env")
    Copy-Item (Join-Path $apiDir ".env.production") (Join-Path $tempCpanel "env")
    Copy-Item (Join-Path $apiDir ".env.production") (Join-Path $tempCpanel "env.txt")
}
if (Test-Path (Join-Path $apiDir ".htaccess")) {
    Copy-Item (Join-Path $apiDir ".htaccess") (Join-Path $tempCpanel ".htaccess")
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($tempCpanel, $cpanelZip)
Remove-Item -Recurse -Force $tempCpanel
Write-Host "Created api-cpanel-deploy.zip"

# 2. Complete backend package (src + dist + prisma + uploads + all configs without node_modules)
$backendZip = Join-Path $root "backend.zip"
if (Test-Path $backendZip) { Remove-Item -Force $backendZip }
$tempBackend = Join-Path ([System.IO.Path]::GetTempPath()) ("backend_all_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempBackend | Out-Null

Get-ChildItem -Path $apiDir -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)|\\\.git(\\|$)'
} | ForEach-Object {
    $relPath = $_.FullName.Substring($apiDir.Length + 1)
    $destFile = Join-Path $tempBackend $relPath
    $destFolder = [System.IO.Path]::GetDirectoryName($destFile)
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder -Force | Out-Null }
    Copy-Item $_.FullName $destFile -Force
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($tempBackend, $backendZip)
Remove-Item -Recurse -Force $tempBackend
Write-Host "Created backend.zip"

Get-Item $cpanelZip, $backendZip | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
