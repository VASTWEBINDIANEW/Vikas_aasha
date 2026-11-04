$ErrorActionPreference = 'Stop'
$csprojPath = Join-Path $PSScriptRoot '..\AashaDigitalIndia24Testing.csproj' | Resolve-Path
$missingFile = Join-Path $PSScriptRoot 'missing-csproj-content.txt'
if (-not (Test-Path $missingFile)) {
    & (Join-Path $PSScriptRoot 'find-missing-csproj-content.ps1') | Out-Null
}
$missing = Get-Content $missingFile | Where-Object { $_.Trim() -ne '' }
if ($missing.Count -eq 0) {
    Write-Output 'No missing content files.'
    exit 0
}
$content = Get-Content $csprojPath -Raw
$lines = New-Object System.Collections.Generic.List[string]
foreach ($rel in ($missing | Sort-Object)) {
    $escaped = $rel -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;'
    if ($content -match [regex]::Escape("<Content Include=`"$($rel -replace '\\','\\')`"")) { continue }
    if ($content -match [regex]::Escape("<Content Include=`"$($rel -replace '\\','/')`"")) { continue }
    $lines.Add("    <Content Include=`"$rel`" />")
}
if ($lines.Count -eq 0) {
    Write-Output 'All missing files already present in csproj.'
    exit 0
}
$insert = "`r`n  <!-- Auto-included missing content (views/css/js) -->`r`n  <ItemGroup>`r`n" + ($lines -join "`r`n") + "`r`n  </ItemGroup>`r`n"
if ($content -notmatch '</Project>\s*\z') {
    throw 'Unexpected csproj format: closing </Project> not found.'
}
$newContent = $content -replace '</Project>\s*\z', ($insert + '</Project>')
Set-Content -Path $csprojPath -Value $newContent -Encoding UTF8 -NoNewline
Write-Output "Added $($lines.Count) Content Include entries to csproj."
