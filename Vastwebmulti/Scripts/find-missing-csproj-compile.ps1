$csproj = Join-Path $PSScriptRoot '..\AashaDigitalIndia24Testing.csproj' | Resolve-Path
$content = Get-Content $csproj -Raw
$included = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($m in [regex]::Matches($content, 'Include="([^"]+\.cs)"')) {
    [void]$included.Add(($m.Groups[1].Value -replace '/','\'))
}
$root = Split-Path $csproj -Parent
$missing = @()
Get-ChildItem -Path $root -Recurse -Filter *.cs -File | Where-Object {
    $_.FullName -notmatch '\\obj\\|\\bin\\|\\packages\\|\\.designer\\.cs$|AssemblyInfo|TemporaryGenerated|\\.g\\.cs$|\\.AssemblyAttributes\\.cs$'
} | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    if (-not $included.Contains($rel)) { $missing += $rel }
}
Write-Output "Missing Compile count: $($missing.Count)"
$missing | Select-Object -First 30
