(function (window) {
    'use strict';

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function nowLabel() {
        try {
            return new Date().toLocaleString();
        } catch (e) {
            return '';
        }
    }

    function warn(message) {
        if (typeof window.swal === 'function') {
            window.swal(message, '', 'warning');
            return;
        }
        window.alert(message);
    }

    function theme(kind) {
        if (kind === 'failed') {
            return {
                primary: '#DC2626',
                dark: '#B91C1C',
                light: '#FEE2E2',
                chipBg: '#FEF2F2',
                chipText: '#B91C1C',
                subtitle: 'Failed web login attempts'
            };
        }
        return {
            primary: '#2563EB',
            dark: '#1D4ED8',
            light: '#DBEAFE',
            chipBg: '#EEF2FF',
            chipText: '#3730A3',
            subtitle: 'Successful web login history'
        };
    }

    function downloadExcel(html, filename) {
        var blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
            return;
        }
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(url); }, 800);
    }

    function openPdf(html) {
        var w = window.open('', '_blank');
        if (!w) {
            warn('Popup blocked. Please allow popups for this site to open PDF.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(function () {
            try {
                w.print();
            } catch (e) { }
        }, 400);
    }

    function buildExcel(options) {
        var cfg = options || {};
        var t = theme(cfg.theme);
        var heads = cfg.heads || [];
        var bodyRows = cfg.bodyRows || [];
        var meta = cfg.meta || {};
        var colCount = heads.length || 1;
        var title = cfg.title || 'Web Login Report';
        var filterNote = meta.search ? (' | Search: ' + meta.search) : '';

        var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /><title>' + esc(title) + '</title></head><body>';
        html += '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;">';
        html += '<tr><td colspan="' + colCount + '" bgcolor="' + t.primary + '" style="color:#FFFFFF;font-size:16pt;font-weight:bold;">' + esc(title) + '</td></tr>';
        html += '<tr><td colspan="' + colCount + '" bgcolor="' + t.dark + '" style="color:' + t.light + ';font-size:10pt;">' + esc(t.subtitle) + '</td></tr>';
        html += '<tr><td bgcolor="#F1F5F9" style="font-weight:bold;">From</td><td colspan="' + Math.max(1, colCount - 3) + '" style="font-weight:bold;">' + esc(meta.frm || '') + '</td>';
        html += '<td bgcolor="#F1F5F9" style="font-weight:bold;">To</td><td colspan="' + Math.max(1, colCount - Math.max(1, colCount - 3) - 2) + '" style="font-weight:bold;">' + esc(meta.to || '') + '</td></tr>';
        html += '<tr><td bgcolor="#F1F5F9" style="font-weight:bold;">Generated</td><td colspan="' + Math.max(1, Math.floor(colCount / 2) - 1) + '" style="font-weight:bold;">' + esc(meta.generatedOn || '') + '</td>';
        html += '<td bgcolor="#F1F5F9" style="font-weight:bold;">Records</td><td colspan="' + Math.max(1, colCount - Math.floor(colCount / 2) - 1) + '" style="font-weight:bold;">' + esc(String(meta.records == null ? bodyRows.length : meta.records)) + filterNote + '</td></tr>';
        html += '<tr>';
        for (var h = 0; h < heads.length; h++) {
            html += '<th bgcolor="#334155" style="color:#FFFFFF;font-weight:bold;">' + esc(heads[h]) + '</th>';
        }
        html += '</tr>';

        if (!bodyRows.length) {
            html += '<tr><td colspan="' + colCount + '" bgcolor="#F8FAFC" style="text-align:center;font-weight:bold;color:#64748B;height:48px;">No records found.</td></tr>';
        } else {
            for (var i = 0; i < bodyRows.length; i++) {
                var row = bodyRows[i] || [];
                var rowBg = (i % 2 === 1) ? '#F8FAFC' : '#FFFFFF';
                html += '<tr>';
                for (var c = 0; c < heads.length; c++) {
                    html += '<td bgcolor="' + rowBg + '">' + esc(row[c] != null ? row[c] : '') + '</td>';
                }
                html += '</tr>';
            }
        }

        html += '</table></body></html>';
        return html;
    }

    function buildPdf(options) {
        var cfg = options || {};
        var t = theme(cfg.theme);
        var heads = cfg.heads || [];
        var bodyRows = cfg.bodyRows || [];
        var meta = cfg.meta || {};
        var title = cfg.title || 'Web Login Report';
        var filterRow = meta.search
            ? '<tr><td colspan="3"><span class="meta-label">Search Filter</span><span class="meta-value">' + esc(meta.search) + '</span></td></tr>'
            : '';

        var headHtml = '';
        for (var h = 0; h < heads.length; h++) {
            headHtml += '<th>' + esc(heads[h]) + '</th>';
        }

        var body = '';
        if (!bodyRows.length) {
            body = '<tr><td colspan="' + Math.max(heads.length, 1) + '" class="empty">No records found.</td></tr>';
        } else {
            for (var i = 0; i < bodyRows.length; i++) {
                var row = bodyRows[i] || [];
                body += '<tr>';
                for (var c = 0; c < heads.length; c++) {
                    body += '<td>' + esc(row[c] != null ? row[c] : '') + '</td>';
                }
                body += '</tr>';
            }
        }

        return '<!DOCTYPE html><html><head><meta charset="utf-8" /><title>' + esc(title) + '</title><style type="text/css">'
            + '@@page { size: A4 landscape; margin: 10mm 8mm 12mm 8mm; }'
            + '* { box-sizing: border-box; } body { margin:0; padding:16px; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#0f172a; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }'
            + 'table { border-collapse:collapse; } .hero { width:100%; border:1px solid ' + t.dark + '; } .hero-top { padding:14px 18px; background:' + t.primary + '; color:#fff; }'
            + '.hero-top h1 { margin:0; font-size:20px; } .hero-top p { margin:4px 0 0; font-size:11px; color:' + t.light + '; }'
            + '.meta { width:100%; background:#f8fafc; } .meta td { padding:8px 12px; border-right:1px solid #e2e8f0; vertical-align:top; }'
            + '.meta-label { display:block; font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#64748b; margin-bottom:3px; }'
            + '.meta-value { font-size:12px; font-weight:700; } .cards { width:100%; margin:12px 0; } .cards td { width:33.33%; padding:0 6px 0 0; vertical-align:top; }'
            + '.card { border:1px solid #e2e8f0; padding:10px 12px; background:' + t.chipBg + '; } .card-label { display:block; font-size:9px; font-weight:700; text-transform:uppercase; margin-bottom:4px; color:#64748b; } .card-value { font-size:16px; font-weight:800; color:' + t.chipText + '; }'
            + '.grid { width:100%; border:1px solid #cbd5e1; } .grid th { padding:9px 7px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; color:#fff; background:#334155; }'
            + '.grid td { padding:8px 7px; font-size:11px; border-top:1px solid #e2e8f0; vertical-align:top; word-break:break-word; } .grid tbody tr:nth-child(even) td { background:#f8fafc; }'
            + '.empty { padding:36px 16px; text-align:center; font-size:14px; font-weight:700; color:#64748b; background:#f8fafc; }'
            + '.foot { margin-top:10px; padding-top:8px; border-top:1px dashed #cbd5e1; font-size:10px; color:#94a3b8; text-align:center; }'
            + '</style></head><body><div class="sheet"><div class="hero"><div class="hero-top"><h1>' + esc(title) + '</h1><p>' + esc(t.subtitle) + '</p></div>'
            + '<table class="meta" cellpadding="0" cellspacing="0"><tr>'
            + '<td style="width:25%;"><span class="meta-label">From</span><span class="meta-value">' + esc(meta.frm || '') + '</span></td>'
            + '<td style="width:25%;"><span class="meta-label">To</span><span class="meta-value">' + esc(meta.to || '') + '</span></td>'
            + '<td style="width:25%;"><span class="meta-label">Generated On</span><span class="meta-value">' + esc(meta.generatedOn || '') + '</span></td>'
            + '<td style="width:25%;"><span class="meta-label">Records</span><span class="meta-value">' + esc(String(meta.records == null ? bodyRows.length : meta.records)) + '</span></td>'
            + '</tr>' + filterRow + '</table></div>'
            + '<table class="cards" cellpadding="0" cellspacing="0"><tr>'
            + '<td><div class="card"><span class="card-label">Date Range</span><span class="card-value">' + esc((meta.frm || '') + ' → ' + (meta.to || '')) + '</span></div></td>'
            + '<td><div class="card"><span class="card-label">Exported Rows</span><span class="card-value">' + esc(String(bodyRows.length)) + '</span></div></td>'
            + '<td><div class="card"><span class="card-label">Report Type</span><span class="card-value">' + esc(cfg.theme === 'failed' ? 'Failed' : 'Success') + '</span></div></td>'
            + '</tr></table>'
            + '<table class="grid" cellpadding="0" cellspacing="0"><thead><tr>' + headHtml + '</tr></thead><tbody>' + body + '</tbody></table>'
            + '<div class="foot">Generated from Dealer panel — ' + esc(title) + '</div></div></body></html>';
    }

    function collectMeta(frmId, toId, searchId, rows) {
        var frmEl = frmId ? document.getElementById(frmId) : null;
        var toEl = toId ? document.getElementById(toId) : null;
        var searchEl = searchId ? document.getElementById(searchId) : null;
        return {
            frm: frmEl ? frmEl.value : '',
            to: toEl ? toEl.value : '',
            search: searchEl ? String(searchEl.value || '').trim() : '',
            records: rows ? rows.length : 0,
            generatedOn: nowLabel()
        };
    }

    window.vmDealerWebLoginExport = {
        esc: esc,
        warn: warn,
        downloadExcel: downloadExcel,
        openPdf: openPdf,
        buildExcel: buildExcel,
        buildPdf: buildPdf,
        collectMeta: collectMeta
    };
})(window);
