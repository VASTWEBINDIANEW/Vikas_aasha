$root = 'D:\Vikas_aasha_web_clone_new\Vastwebmulti'

$views = @{}
Get-ChildItem -Path $root -Recurse -Filter '*.cshtml' | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1).Replace('\','/')
    $views[$rel.ToLower()] = $rel
}

$actions = @()
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
        $start = $m.Index
        $snippet = $content.Substring($start, [Math]::Min(2000, $content.Length - $start))
        $explicitView = $null
        if ($snippet -match 'return\s+View\s*\(\s*"([^"]+)"') { $explicitView = $Matches[1] }
        elseif ($snippet -match "return\s+View\s*\(\s*'([^']+)'") { $explicitView = $Matches[1] }
        $viewName = if ($explicitView) { $explicitView } else { $actionName }
        $isPartial = ($snippet -match 'PartialViewResult|return\s+PartialView')
        $expectedPaths = @()
        if ($area) {
            if ($isPartial) {
                $expectedPaths += "Areas/$area/Views/$ctrlName/_$viewName.cshtml".ToLower()
                $expectedPaths += "Areas/$area/Views/Shared/_$viewName.cshtml".ToLower()
            }
            $expectedPaths += "Areas/$area/Views/$ctrlName/$viewName.cshtml".ToLower()
        } else {
            if ($isPartial) {
                $expectedPaths += "Views/$ctrlName/_$viewName.cshtml".ToLower()
                $expectedPaths += "Views/Shared/_$viewName.cshtml".ToLower()
            }
            $expectedPaths += "Views/$ctrlName/$viewName.cshtml".ToLower()
        }
        $found = $false
        $foundPath = $null
        foreach ($ep in $expectedPaths) {
            if ($views.ContainsKey($ep)) { $found = $true; $foundPath = $views[$ep]; break }
        }
        $actions += [PSCustomObject]@{
            Area = $area
            Controller = $ctrlName
            Action = $actionName
            ViewName = $viewName
            IsPartial = $isPartial
            ControllerFile = $relPath
            ViewFound = $found
            ViewPath = $foundPath
            ExpectedPrimary = if ($area) { "Areas/$area/Views/$ctrlName/$viewName.cshtml" } else { "Views/$ctrlName/$viewName.cshtml" }
        }
    }
}

$missingFull = $actions | Where-Object { -not $_.ViewFound -and -not $_.IsPartial }
$missingPartial = $actions | Where-Object { -not $_.ViewFound -and $_.IsPartial }

Write-Output "CONTROLLERS:$($controllerFiles.Count)"
Write-Output "VIEWS:$($views.Count)"
Write-Output "ACTIONS:$($actions.Count)"
Write-Output "MISSING_FULL:$($missingFull.Count)"
Write-Output "MISSING_PARTIAL:$($missingPartial.Count)"
Write-Output '---MISSING_FULL---'
$missingFull | Sort-Object Area, Controller, Action | ForEach-Object {
    Write-Output "$($_.Area)|$($_.Controller)|$($_.Action)|$($_.ExpectedPrimary)|$($_.ControllerFile)"
}
Write-Output '---MISSING_PARTIAL---'
$missingPartial | Sort-Object Area, Controller, Action | ForEach-Object {
    Write-Output "$($_.Area)|$($_.Controller)|$($_.Action)|$($_.ExpectedPrimary)|$($_.ControllerFile)"
}

# Explicit View() names check
Write-Output '---EXPLICIT_VIEW_MISSING---'
foreach ($file in $controllerFiles) {
    $content = Get-Content $file.FullName -Raw
    $relPath = $file.FullName.Substring($root.Length + 1).Replace('\','/')
    $area = $null
    if ($relPath -match 'Areas/([^/]+)/') { $area = $Matches[1] }
    $ctrlName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) -replace 'Controller$',''
    $viewMatches = [regex]::Matches($content, 'return\s+View\s*\(\s*"([^"]+)"')
    foreach ($vm in $viewMatches) {
        $viewName = $vm.Groups[1].Value
        $paths = @()
        if ($area) {
            $paths += "Areas/$area/Views/$ctrlName/$viewName.cshtml".ToLower()
            $paths += "Areas/$area/Views/Home/$viewName.cshtml".ToLower()
            $paths += "Areas/$area/Views/Shared/$viewName.cshtml".ToLower()
        } else {
            $paths += "Views/$ctrlName/$viewName.cshtml".ToLower()
            $paths += "Views/Shared/$viewName.cshtml".ToLower()
            $paths += "Views/Home/$viewName.cshtml".ToLower()
        }
        $found = $false
        foreach ($p in $paths) { if ($views.ContainsKey($p)) { $found = $true; break } }
        if (-not $found) {
            Write-Output "$area|$ctrlName|explicit:$viewName|$relPath"
        }
    }
}

# Controller list
Write-Output '---CONTROLLERS---'
$controllerFiles | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1).Replace('\','/')
    Write-Output $rel
}
