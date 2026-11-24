Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceRoot = "c:\Users\THATIPALLY VINOD\OneDrive\Desktop\Ayyappa"
$zipPath = Join-Path $sourceRoot "saranam-ayyappa-full-project.zip"
$stagingDir = Join-Path ([System.IO.Path]::GetTempPath()) ("saranam_ayyappa_staging_" + [System.Guid]::NewGuid().ToString("N"))

Write-Host "Creating clean staging directory at: $stagingDir"
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }
New-Item -ItemType Directory -Path $stagingDir | Out-Null

if (Test-Path $zipPath) { 
    Write-Host "Removing existing zip at: $zipPath"
    Remove-Item -Force $zipPath 
}

# 1. Create directory structure in staging
$dirsToCreate = @(
    "apps\mobile",
    "apps\api",
    "apps\admin-panel",
    "database",
    "docs",
    "uploads"
)
foreach ($d in $dirsToCreate) {
    New-Item -ItemType Directory -Path (Join-Path $stagingDir $d) -Force | Out-Null
}

Write-Host "Copying apps/mobile..."
Get-ChildItem -Path (Join-Path $sourceRoot "apps\mobile") -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)|\\\.expo(\\|$)|apps\\mobile\\android\\\.gradle(\\|$)|apps\\mobile\\android\\build(\\|$)|apps\\mobile\\android\\app\\build(\\|$)'
} | ForEach-Object {
    $relPath = $_.FullName.Substring((Join-Path $sourceRoot "apps\mobile").Length + 1)
    $destFile = Join-Path (Join-Path $stagingDir "apps\mobile") $relPath
    $destFolder = [System.IO.Path]::GetDirectoryName($destFile)
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder -Force | Out-Null }
    Copy-Item $_.FullName $destFile -Force
}

Write-Host "Copying apps/api..."
Get-ChildItem -Path (Join-Path $sourceRoot "apps\api") -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)|\\dist(\\|$)|\\\.cache(\\|$)'
} | ForEach-Object {
    $relPath = $_.FullName.Substring((Join-Path $sourceRoot "apps\api").Length + 1)
    $destFile = Join-Path (Join-Path $stagingDir "apps\api") $relPath
    $destFolder = [System.IO.Path]::GetDirectoryName($destFile)
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder -Force | Out-Null }
    Copy-Item $_.FullName $destFile -Force
}

Write-Host "Copying apps/admin-panel..."
Get-ChildItem -Path (Join-Path $sourceRoot "apps\admin-panel") -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)|\\\.next(\\|$)|\\\.cache(\\|$)'
} | ForEach-Object {
    $relPath = $_.FullName.Substring((Join-Path $sourceRoot "apps\admin-panel").Length + 1)
    $destFile = Join-Path (Join-Path $stagingDir "apps\admin-panel") $relPath
    $destFolder = [System.IO.Path]::GetDirectoryName($destFile)
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder -Force | Out-Null }
    Copy-Item $_.FullName $destFile -Force
}

Write-Host "Copying docs and uploads..."
if (Test-Path (Join-Path $sourceRoot "docs")) {
    Copy-Item -Recurse (Join-Path $sourceRoot "docs\*") (Join-Path $stagingDir "docs") -Force
}
if (Test-Path (Join-Path $sourceRoot "uploads")) {
    Copy-Item -Recurse (Join-Path $sourceRoot "uploads\*") (Join-Path $stagingDir "uploads") -Force
}

Write-Host "Setting up database folder with dump files..."
$dbDir = Join-Path $stagingDir "database"
Copy-Item (Join-Path $sourceRoot "ayyappa_aradhana_dump.sql") (Join-Path $dbDir "ayyappa_aradhana_dump.sql") -Force
Copy-Item (Join-Path $sourceRoot "ayyappa_aradhana_cpanel.sql") (Join-Path $dbDir "ayyappa_aradhana_cpanel.sql") -Force
Copy-Item (Join-Path $sourceRoot "apps\api\prisma\schema.prisma") (Join-Path $dbDir "schema.prisma") -Force
if (Test-Path (Join-Path $sourceRoot "apps\api\prisma\seed_rashi_nakshatra.js")) {
    Copy-Item (Join-Path $sourceRoot "apps\api\prisma\seed_rashi_nakshatra.js") (Join-Path $dbDir "seed_rashi_nakshatra.js") -Force
}

$readmeDbPath = Join-Path $dbDir "DATABASE_IMPORT_GUIDE.md"
@"
# Saranam Ayyappa — Database Setup & Import Guide

This directory contains the complete database files and SQL data dumps for the Saranam Ayyappa platform.

## Included Database Files:
1. **ayyappa_aradhana_dump.sql**
   - Full MariaDB 10.4 / MySQL 8.0 database dump.
   - Contains all table structures, foreign keys, constraints, and populated seed data.
   - Includes tables: app_users, admin_users, categories, subcategories, devotional_contents, audio_tracks, panchangam_entries, festivals, cms_pages, donations, food_donation_centers, rashis, nakshatras, etc.

2. **ayyappa_aradhana_cpanel.sql**
   - Optimized dump tailored for cPanel / phpMyAdmin live web hosting environments.

3. **schema.prisma**
   - Complete Prisma declarative ORM schema defining all database models, relations, and enums.

4. **seed_rashi_nakshatra.js**
   - Script to populate Vedic Rashis and Nakshatras data.

---

## How to Import the Database:

### Option A: Via Command Line (MySQL / MariaDB CLI)
Run the following in your terminal:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ayyappa_aradhana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ayyappa_aradhana < ayyappa_aradhana_dump.sql

### Option B: Via phpMyAdmin (Local or cPanel Hosting)
1. Open phpMyAdmin on your server.
2. Click New and create a database named ayyappa_aradhana with collation utf8mb4_unicode_ci.
3. Select ayyappa_aradhana in the left panel.
4. Click the Import tab at the top.
5. Choose ayyappa_aradhana_dump.sql (or ayyappa_aradhana_cpanel.sql).
6. Click Go / Import.

### Option C: Via Prisma CLI
If connecting to an existing empty database:
cd apps/api
npx prisma db push
"@ | Out-File -FilePath $readmeDbPath -Encoding utf8

Write-Host "Copying root files..."
$rootFiles = @(
    "ayyappa_aradhana_dump.sql",
    "ayyappa_aradhana_cpanel.sql",
    "README_FOR_FRIEND.md",
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    ".gitignore",
    ".npmrc",
    "cpanel.env",
    "README.md",
    "run.bat",
    "start-all.bat",
    "run-mobile.bat",
    "run-web.bat",
    "build-apk.bat",
    "index.ts",
    "index.js"
)
foreach ($f in $rootFiles) {
    $src = Join-Path $sourceRoot $f
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $stagingDir $f) -Force
    }
}

Write-Host "Compressing staging folder into: $zipPath..."
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $stagingDir, 
    $zipPath, 
    [System.IO.Compression.CompressionLevel]::Optimal, 
    $false
)

Write-Host "Cleaning up staging directory..."
Remove-Item -Recurse -Force $stagingDir

$zipItem = Get-Item $zipPath
$zipSizeMb = [Math]::Round($zipItem.Length / 1MB, 2)
Write-Host ("ALL DONE! Saranam Ayyappa project package successfully created:")
Write-Host ("File: " + $zipPath + " (" + $zipSizeMb + " MB)")
