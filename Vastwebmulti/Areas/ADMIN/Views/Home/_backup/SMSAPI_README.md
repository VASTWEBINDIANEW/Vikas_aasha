# SMS API Page — Backup & Reference

## Backup files (16 Jul 2026)
- `SMSAPI.cshtml.bak` — modernized ADMIN view before full fix
- `_APISETTINGS.cshtml.bak` — API settings partial
- `admin-sms-api-page.css.bak` — page-specific CSS

## Original working pattern (WHITELABEL)
Right panel structure that worked in old design:

```
.smsapi-second
  ul.tabs (API History | Outbox | API Setting)
  #tab-1.tab-content
  #tab-3.tab-content
  #ApiSettings
    #tab-4.tab-content  ← inside _APISETTINGS partial
```

Tab click adds `.current` to `#tab-4` inside `#ApiSettings`.
AJAX reload: `$('#ApiSettings').html(response); $('#LoaddataTemp').click();`

Reference: `Areas/WHITELABEL/Views/Home/SMSAPI.cshtml`

## Restore
To revert to pre-fix modern version, copy `.bak` files back to parent folder.
