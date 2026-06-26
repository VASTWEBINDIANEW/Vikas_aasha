Set-Location 'd:\Vikas_aasha_web_clone_new\Vastwebmulti\Areas\ADMIN\Views\Home'
$all = Get-Content '_DistibutorList.cshtml'
$modal = $all[229..791]
"@model Vastwebmulti.Areas.ADMIN.Models.DealerModel`r`n" | Out-File '_DistibutorlistModals.cshtml' -Encoding utf8
$modal | Out-File '_DistibutorlistModals.cshtml' -Append -Encoding utf8
$table = $all[0..227]
$scripts = $all[792..($all.Length - 1)]
($table + $scripts) | Out-File '_DistibutorList.cshtml' -Encoding utf8
Write-Host "Split complete. Modal lines: $($modal.Count)"
