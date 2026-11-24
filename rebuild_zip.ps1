Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "c:\Users\THATIPALLY VINOD\OneDrive\Desktop\Ayyappa\api-cpanel-deploy.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "cpanel_deploy_package"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Copy-Item -Recurse "apps\api\dist" (Join-Path $tempDir "dist")
Copy-Item -Recurse "apps\api\prisma" (Join-Path $tempDir "prisma")
Copy-Item -Recurse "apps\api\uploads" (Join-Path $tempDir "uploads")
Copy-Item "apps\api\package.json" (Join-Path $tempDir "package.json")
Copy-Item "apps\api\app.js" (Join-Path $tempDir "app.js")
Copy-Item "apps\api\.env.production" (Join-Path $tempDir ".env")
Copy-Item "apps\api\.env.production" (Join-Path $tempDir "env")
Copy-Item "apps\api\.env.production" (Join-Path $tempDir "env.txt")
Copy-Item "apps\api\.htaccess" (Join-Path $tempDir ".htaccess")

[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
Remove-Item -Recurse -Force $tempDir
