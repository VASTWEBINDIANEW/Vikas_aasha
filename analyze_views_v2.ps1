$root = 'D:\Vikas_aasha_web_clone_new\Vastwebmulti'

$views = @{}
Get-ChildItem -Path $root -Recurse -Filter '*.cshtml' | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1).Replace('\','/')
    $views[$rel.ToLower()] = $rel
}

function Get-MethodBody($content, $startIndex) {
    $braceStart = $content.IndexOf('{', $startIndex)
    if ($braceStart -lt 0) { return '' }
    $depth = 0
    for ($i = $braceStart; $i -lt $content.Length; $i++) {
        $c = $content[$i]
        if ($c -eq '{') { $depth++ }
        elseif ($c -eq '}') {
            $depth--
            if ($depth -eq 0) { return $content.Substring($braceStart, $i - $braceStart + 1) }
        }
    }
    return $content.Substring($braceStart, [Math]::Min(5000, $content.Length - $braceStart))
}

function Test-ViewExists($area, $ctrlName, $viewName, $isPartial) {
    $paths = @()
    if ($area) {
        if ($isPartial) {
            $paths += "Areas/$area/Views/$ctrlName/_$viewName.cshtml".ToLower()
            $paths += "Areas/$area/Views/Shared/_$viewName.cshtml".ToLower()
        }
        $paths += "Areas/$area/Views/$ctrlName/$viewName.cshtml".ToLower()
        $paths += "Areas/$area/Views/Home/$viewName.cshtml".ToLower()
        $paths += "Areas/$area/Views/Shared/$viewName.cshtml".ToLower()
    } else {
        if ($isPartial) {
            $paths += "Views/$ctrlName/_$viewName.cshtml".ToLower()
            $paths += "Views/Shared/_$viewName.cshtml".ToLower()
        }
        $paths += "Views/$ctrlName/$viewName.cshtml".ToLower()
        $paths += "Views/Shared/$viewName.cshtml".ToLower()
        $paths += "Views/Home/$viewName.cshtml".ToLower()
    }
    foreach ($p in $paths) {
        if ($views.ContainsKey($p)) { return @{ Found = $true; Path = $views[$p] } }
    }
    return @{ Found = $false; Path = $null }
}

$viewReturningActions = @()
$controllerFiles = Get-ChildItem -Path $root -Recurse -Filter '*Controller.cs' | Where-Object {
    $_.FullName -notmatch '\\obj\\|\\bin\\'
}

foreach ($file in $controllerFiles) {
    $content = Get-Content $file.FullName -Raw
    $relPath = $file.FullName.Substring($root.Length + 1).Replace('\','/')
    $area = $null
    if ($relPath -match 'Areas/([^/]+)/') { $area = $Matches[1] }
    $ctrlName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) -replace 'Controller$',''
    $methodMatches = [regex]::Matches($content, '(?m)^\s*public\s+(?:async\s+Task<(?:ActionResult|ViewResult|PartialViewResult)>|ActionResult|ViewResult|PartialViewResult)\s+(\w+)\s*\(')
    foreach ($m in $methodMatches) {
        $actionName = $m.Groups[1].Value
        if ($actionName -eq 'Dispose') { continue }
        $body = Get-MethodBody $content $m.Index
        if ($body -notmatch 'return\s+(PartialView|View)\s*\(') { continue }

        $isPartial = ($body -match 'return\s+PartialView\s*\(')
        $explicitView = $null
        if ($body -match 'return\s+(?:Partial)?View\s*\(\s*"([^"]+)"') { $explicitView = $Matches[1] }
        elseif ($body -match "return\s+(?:Partial)?View\s*\(\s*'([^']+)'") { $explicitView = $Matches[1] }

        $viewName = if ($explicitView) { $explicitView } else { $actionName }
        $result = Test-ViewExists $area $ctrlName $viewName $isPartial
        $viewReturningActions += [PSCustomObject]@{
            Area = $area
            Controller = $ctrlName
            Action = $actionName
            ViewName = $viewName
            IsPartial = $isPartial
            ControllerFile = $relPath
            ViewFound = $result.Found
            ViewPath = $result.Path
            ExpectedPrimary = if ($area) { "Areas/$area/Views/$ctrlName/$viewName.cshtml" } else { "Views/$ctrlName/$viewName.cshtml" }
        }
    }
}

$missing = $viewReturningActions | Where-Object { -not $_.ViewFound }

Write-Output "VIEW_RETURNING_ACTIONS:$($viewReturningActions.Count)"
Write-Output "MISSING_VIEWS:$($missing.Count)"
Write-Output '---MISSING---'
$missing | Sort-Object Area, Controller, Action | ForEach-Object {
    $type = if ($_.IsPartial) { 'PARTIAL' } else { 'FULL' }
    Write-Output "$type|$($_.Area)|$($_.Controller)|$($_.Action)|$($_.ViewName)|$($_.ExpectedPrimary)|$($_.ControllerFile)"
}

# Controller action inventory
Write-Output '---CONTROLLER_ACTIONS---'
foreach ($file in ($controllerFiles | Sort-Object FullName)) {
    $content = Get-Content $file.FullName -Raw
    $relPath = $file.FullName.Substring($root.Length + 1).Replace('\','/')
    $area = $null
    if ($relPath -match 'Areas/([^/]+)/') { $area = $Matches[1] }
    $ctrlName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) -replace 'Controller$',''
    $methodMatches = [regex]::Matches($content, '(?m)^\s*public\s+(?:async\s+Task<(?:ActionResult|ViewResult|PartialViewResult)>|ActionResult|ViewResult|PartialViewResult)\s+(\w+)\s*\(')
    $actions = @()
    foreach ($m in $methodMatches) {
        if ($m.Groups[1].Value -ne 'Dispose') { $actions += $m.Groups[1].Value }
    }
    $prefix = if ($area) { "$area/$ctrlName" } else { $ctrlName }
    Write-Output "$prefix|$($actions.Count)|$($actions -join ',')"
}

# Scan navigation links in cshtml
Write-Output '---NAV_LINKS---'
$linkPattern = '(?:Url\.Action\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"|href\s*=\s*"@Url\.Action\s*\(\s*''([^'']+)''\s*,\s*''([^'']+)''|Html\.ActionLink\s*\(\s*"[^"]*"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"|href\s*=\s*"/(?:Areas/)?([^"?#]+)/([^"?#/]+)/([^"?#/]+))'
Get-ChildItem -Path $root -Recurse -Filter '*.cshtml' | ForEach-Object {
    $fileRel = $_.FullName.Substring($root.Length + 1).Replace('\','/')
    $lines = Get-Content $_.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $matches = [regex]::Matches($line, $linkPattern)
        foreach ($m in $matches) {
            $action = $null; $controller = $null; $area = $null
            if ($m.Groups[1].Success -and $m.Groups[1].Value) {
                $action = $m.Groups[1].Value; $controller = $m.Groups[2].Value
            } elseif ($m.Groups[3].Success -and $m.Groups[3].Value) {
                $action = $m.Groups[3].Value; $controller = $m.Groups[4].Value
            } elseif ($m.Groups[5].Success -and $m.Groups[5].Value) {
                $action = $m.Groups[5].Value; $controller = $m.Groups[6].Value
            } elseif ($m.Groups[7].Success -and $m.Groups[7].Value) {
                $parts = $m.Groups[7].Value -split '/'
                if ($parts[0] -eq 'Areas' -and $parts.Length -ge 4) {
                    $area = $parts[1]; $controller = $parts[2]; $action = $parts[3]
                } elseif ($parts.Length -ge 2) {
                    $controller = $parts[0]; $action = $parts[1]
                }
            }
            if ($action -and $controller) {
                $result = Test-ViewExists $area $controller $action $false
                if (-not $result.Found) {
                    Write-Output "BROKEN|$area|$controller|$action|$fileRel`:$($i+1)"
                }
            }
        }
    }
}
