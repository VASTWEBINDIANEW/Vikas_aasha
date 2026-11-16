# Adds missing .cs files to the project (excludes duplicates/backups under controllers\controllers and misplaced copies).
$ErrorActionPreference = 'Stop'
$csprojPath = Join-Path $PSScriptRoot '..\AashaDigitalIndia24Testing.csproj' | Resolve-Path
& (Join-Path $PSScriptRoot 'find-missing-csproj-compile.ps1') | Out-Null
$content = Get-Content $csprojPath -Raw
$missing = @(
    'Areas\RETAILER\Controllers\controllers\',
    'Areas\ADMIN\Views\Shared\ADMINAreaRegistration.cs'
)
$root = Split-Path $csprojPath -Parent
$toAdd = @()
Get-ChildItem -Path $root -Recurse -Filter *.cs -File | Where-Object {
    $_.FullName -notmatch '\\obj\\|\\bin\\|\\packages\\|\\.designer\\.cs$|AssemblyInfo|TemporaryGenerated|\\.g\\.cs$|\\.AssemblyAttributes\\.cs$'
} | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    $skip = $false
    foreach ($prefix in $missing) {
        if ($rel -like "*$prefix*") { $skip = $true; break }
    }
    if ($skip) { return }
    if ($content -match [regex]::Escape("<Compile Include=`"$($rel -replace '\\','\\\\')`"")) { return }
    if ($content -match [regex]::Escape("<Compile Include=`"$rel`"")) { return }
    $toAdd += $rel
}
if ($toAdd.Count -eq 0) {
    Write-Output 'No safe missing Compile entries to add.'
    exit 0
}
$lines = $toAdd | Sort-Object -Unique | ForEach-Object { "    <Compile Include=`"$_`" />" }
$insert = "`r`n  <!-- Auto-included missing Compile (safe) -->`r`n  <ItemGroup>`r`n" + ($lines -join "`r`n") + "`r`n  </ItemGroup>`r`n"
$newContent = $content -replace '</Project>\s*\z', ($insert + '</Project>')
Set-Content -Path $csprojPath -Value $newContent -Encoding UTF8 -NoNewline
Write-Output "Added $($lines.Count) Compile Include entries."