# PB Valley Chiang Rai - Local HTTP Server
# Solves YouTube Error 153 by providing a valid HTTP Origin (http://localhost:8080)
$ErrorActionPreference = "Stop"

$port = 8080
$maxPort = 8090
$listener = $null

while ($port -le $maxPort) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
        break
    } catch {
        $listener = $null
        $port++
    }
}

if (-not $listener) {
    Write-Host "[ERROR] Could not start local server on ports 8080-8090." -ForegroundColor Red
    Pause
    exit 1
}

$url = "http://localhost:$port/index.html"
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   PB Valley Chiang Rai - Web Server is RUNNING" -ForegroundColor Yellow
Write-Host "   URL: $url" -ForegroundColor Cyan
Write-Host "   (แก้ปัญหา YouTube Error 153 เล่นวิดีโอได้ 100%)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "เปิดหน้าต่างนี้ไว้ขณะใช้งานเว็บ (ปิดหน้าต่างนี้เมื่อต้องการหยุด)" -ForegroundColor Gray

Start-Process $url

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawPath) -or $rawPath -eq '/') {
            $rawPath = 'index.html'
        }

        $rawPath = [System.Uri]::UnescapeDataString($rawPath)
        $filePath = Join-Path $baseDir $rawPath

        if (Test-Path -Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()

            switch ($ext) {
                '.html' { $response.ContentType = 'text/html; charset=utf-8' }
                '.htm'  { $response.ContentType = 'text/html; charset=utf-8' }
                '.css'  { $response.ContentType = 'text/css; charset=utf-8' }
                '.js'   { $response.ContentType = 'application/javascript; charset=utf-8' }
                '.json' { $response.ContentType = 'application/json; charset=utf-8' }
                '.png'  { $response.ContentType = 'image/png' }
                '.jpg'  { $response.ContentType = 'image/jpeg' }
                '.jpeg' { $response.ContentType = 'image/jpeg' }
                '.webp' { $response.ContentType = 'image/webp' }
                '.svg'  { $response.ContentType = 'image/svg+xml' }
                '.mp4'  { $response.ContentType = 'video/mp4' }
                default { $response.ContentType = 'application/octet-stream' }
            }

            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $rawPath")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Ignore client disconnects
    }
}
