Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$src = "C:\Users\THATIPALLY VINOD\.gemini\antigravity\brain\4bb96292-3cdc-4f47-bcea-b99ef6bb3a15\.user_uploaded\media_1794903867397_868ab4a1.webp"
$uri = New-Object System.Uri($src)
$decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($uri, [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
$frame = $decoder.Frames[0]
$width = $frame.PixelWidth
$height = $frame.PixelHeight
$stride = $width * 4
$pixels = New-Object byte[] ($height * $stride)
$frame.CopyPixels($pixels, $stride, 0)

$cleaned = 0
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        # Genuine red areas:
        # 1. Tilak / crown ruby: x in 410..510, y in 170..280
        $isRuby = ($x -ge 410 -and $x -le 510 -and $y -ge 170 -and $y -le 280)
        # 2. Main garlands: x in 180..740, y in 330..940
        $isGarland = ($x -ge 180 -and $x -le 740 -and $y -ge 330 -and $y -le 940)
        # 3. Bottom flowers: y in 880..960
        $isBottomFlower = ($y -ge 880 -and $y -le 960)

        if ($isRuby -or $isGarland -or $isBottomFlower) {
            continue
        }

        $idx = $y * $stride + $x * 4
        $b = $pixels[$idx]
        $g = $pixels[$idx + 1]
        $r = $pixels[$idx + 2]
        $a = $pixels[$idx + 3]

        # Check for red eraser artifacts (high red, low green and blue)
        if ($a -gt 15 -and $r -gt 130 -and $g -lt 85 -and $b -lt 85) {
            $pixels[$idx + 3] = 0
            $cleaned++
        }
    }
}
Write-Host "Cleaned $cleaned artifact pixels."

$pixelFormat = [System.Windows.Media.PixelFormats]::Bgra32
$wb = New-Object System.Windows.Media.Imaging.WriteableBitmap($width, $height, 96, 96, $pixelFormat, $null)
$rect = New-Object System.Windows.Int32Rect(0, 0, $width, $height)
$wb.WritePixels($rect, $pixels, $stride, 0)

$destPng = "C:\Users\THATIPALLY VINOD\OneDrive\Desktop\Ayyappa\apps\mobile\assets\ayyappa_hero_foreground.png"
if (Test-Path $destPng) {
    Remove-Item -Force $destPng
}
$destStream = [System.IO.File]::Create($destPng)
$encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($wb))
$encoder.Save($destStream)
$destStream.Dispose()

Write-Host "Successfully saved $destPng, size: $((Get-Item $destPng).Length) bytes"

# Also copy raw webp to mobile assets as fallback/direct asset
$destWebp = "C:\Users\THATIPALLY VINOD\OneDrive\Desktop\Ayyappa\apps\mobile\assets\ayyappa_hero_foreground.webp"
Copy-Item -Path $src -Destination $destWebp -Force
Write-Host "Saved raw webp to $destWebp"
