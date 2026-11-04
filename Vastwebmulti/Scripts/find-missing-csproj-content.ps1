$csproj = Join-Path $PSScriptRoot '..\AashaDigitalIndia24Testing.csproj' | Resolve-Path
$content = Get-Content $csproj -Raw
$included = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($m in [regex]::Matches($content, 'Include="([^"]+)"')) {
    $p = $m.Groups[1].Value -replace '/','\'
    [void]$included.Add($p)
}
$root = Split-Path $csproj -Parent
$missing = New-Object System.Collections.Generic.List[string]
Get-ChildItem -Path $root -Recurse -Include *.cshtml,*.css,*.js -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\obj\\|\\bin\\|\\packages\\|node_modules' } |
    ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1)
        if (-not $included.Contains($rel)) {
            [void]$missing.Add($rel)
        }
    }
Write-Output "Missing count: $($missing.Count)"
$missing | Sort-Object | Out-File (Join-Path $PSScriptRoot 'missing-csproj-content.txt') -Encoding UTF8
$missing | Select-Object -First 150
