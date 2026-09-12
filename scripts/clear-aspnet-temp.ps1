# Clears ASP.NET temporary compiled view cache (fixes "not enough space on disk" parser errors)
$paths = @(
    "$env:TEMP",
    "$env:LOCALAPPDATA\Temp",
    "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\Temporary ASP.NET Files",
    "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\Temporary ASP.NET Files"
)

foreach ($path in $paths) {
    if (-not (Test-Path $path)) {
        Write-Host "Skip (missing): $path"
        continue
    }

    Write-Host "Cleaning: $path"
    Get-ChildItem $path -Force -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Remove-Item $_.FullName -Recurse -Force -ErrorAction Stop
            Write-Host "  Removed: $($_.Name)"
        }
        catch {
            Write-Host "  Locked/skipped: $($_.Name)"
        }
    }
}

Write-Host ""
Write-Host "Done. Restart IIS / your web app, then reload the page."
Write-Host "If error continues, free space on C: drive (need at least 1-2 GB free)."
