/* Shared modern PDF/print layout for admin report pages */
(function (window) {
    'use strict';

    function escapeHtml(value) {
        if (value == null) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatPrintDate(value) {
        return value ? escapeHtml(String(value).replace(/\u2014/g, '-').replace(/\u2013/g, '-')) : '-';
    }

    function sanitizeExportText(value) {
        if (value == null) {
            return '';
        }
        return String(value)
            .replace(/\u2014/g, '-')
            .replace(/\u2013/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isNumericExportValue(value) {
        return /^-?\d+(?:\.\d+)?$/.test(String(value || '').replace(/,/g, '').trim());
    }

    function buildTableHtmlFromData(data) {
        var html = '<table><thead><tr>';
        var i;
        var r;
        var c;
        var align;

        for (i = 0; i < data.headers.length; i++) {
            html += '<th>' + escapeHtml(data.headers[i]) + '</th>';
        }
        html += '</tr></thead><tbody>';

        if (!data.rows.length) {
            html += '<tr><td colspan="' + Math.max(data.headers.length, 1) + '" style="text-align:center;padding:24px;color:#64748b;">No data found.</td></tr>';
        } else {
            for (r = 0; r < data.rows.length; r++) {
                html += '<tr>';
                for (c = 0; c < data.rows[r].cells.length; c++) {
                    align = isNumericExportValue(data.rows[r].cells[c]) ? 'right' : 'left';
                    html += '<td style="text-align:' + align + ';">' + escapeHtml(data.rows[r].cells[c]) + '</td>';
                }
                html += '</tr>';
            }
        }

        html += '</tbody></table>';
        return html;
    }

    function getPdfMetaIcon(type) {
        var icons = {
            from: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 2v3M16 2v3M4 9h16M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/></svg>',
            to: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 2v3M16 2v3M4 9h16M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/><path d="M8 13h8" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/></svg>',
            generated: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#2563eb" stroke-width="2"/><path d="M12 7v5l3 2" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/></svg>',
            records: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/></svg>'
        };
        return icons[type] || icons.records;
    }

    function formatGeneratedAt() {
        try {
            return new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return new Date().toLocaleString();
        }
    }

    function isNoDataRow(row) {
        if (!row) {
            return false;
        }
        if (row.querySelector('.no-data-found-img, img[src*="NoDatall"]')) {
            return true;
        }
        if (row.classList.contains('vm-opr-table-empty-row')) {
            return true;
        }
        return false;
    }

    function countDataRows(tableClone) {
        var rows = tableClone.querySelectorAll('tbody tr');
        var count = 0;
        var i;

        for (i = 0; i < rows.length; i++) {
            if (isNoDataRow(rows[i])) {
                continue;
            }
            if (rows[i].classList.contains('vm-uwc-row-total') || rows[i].classList.contains('vm-ai-row-total') || rows[i].classList.contains('vm-adb-row-total')) {
                continue;
            }
            var firstCell = rows[i].querySelector('td');
            if (firstCell && /^total$/i.test((firstCell.innerText || firstCell.textContent || '').replace(/\s+/g, ' ').trim())) {
                continue;
            }
            count++;
        }

        return count;
    }

    function prepareTableClone(sourceTable) {
        var clone = sourceTable.cloneNode(true);
        var hiddenNodes = clone.querySelectorAll('.vm-uwc-col-hidden');
        var bodyRows = clone.querySelectorAll('tbody tr');
        var i;

        for (i = hiddenNodes.length - 1; i >= 0; i--) {
            if (hiddenNodes[i].parentNode) {
                hiddenNodes[i].parentNode.removeChild(hiddenNodes[i]);
            }
        }

        for (i = bodyRows.length - 1; i >= 0; i--) {
            if (isNoDataRow(bodyRows[i]) && bodyRows[i].parentNode) {
                bodyRows[i].parentNode.removeChild(bodyRows[i]);
            }
        }

        var removable = clone.querySelectorAll('img, script, .no-data-found-img');
        for (i = removable.length - 1; i >= 0; i--) {
            if (removable[i].parentNode) {
                removable[i].parentNode.removeChild(removable[i]);
            }
        }

        return clone;
    }

    function getModernPdfStyles(orientation, theme) {
        var pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
        var tableFontSize = orientation === 'landscape' ? '7px' : '9px';
        var thPadding = orientation === 'landscape' ? '5px 3px' : '7px 6px';
        var tdPadding = orientation === 'landscape' ? '4px 3px' : '6px 5px';
        var isGray = theme === 'gray';
        var headerBg = isGray
            ? 'background: linear-gradient(180deg, #f8fafc, #f1f5f9); color: #0f172a; border: 1px solid #e2e8f0;'
            : 'background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%); color: #fff; box-shadow: 0 8px 24px rgba(30, 58, 138, 0.22);';
        var brandColor = isGray ? 'color: #64748b; opacity: 1;' : 'opacity: 0.9;';
        var subtitleColor = isGray ? 'color: #64748b; opacity: 1;' : 'opacity: 0.92;';
        var thBg = isGray ? '#f1f5f9' : '#1e3a8a';
        var thColor = isGray ? '#475569' : '#fff';
        var thBorder = isGray ? '#e2e8f0' : '#1d4ed8';
        var th2Bg = isGray ? '#eef2f7' : '#1e40af';
        var totalBg = isGray ? '#e2e8f0' : '#dbeafe';
        var totalColor = isGray ? '#334155' : '#1e3a8a';
        var totalBorder = isGray ? '#94a3b8' : '#3b82f6';

        return ''
            + '@page { size: ' + pageSize + '; margin: 10mm 8mm 12mm; }'
            + '* { box-sizing: border-box; }'
            + 'html, body { margin: 0; padding: 0; background: #eef2f7; color: #0f172a; font-family: "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
            + '.pdf-shell { max-width: 100%; margin: 0 auto; padding: 14px; }'
            + '.pdf-header { ' + headerBg + ' border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; }'
            + '.pdf-header__brand { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; ' + brandColor + ' }'
            + '.pdf-header__brand svg { flex: 0 0 auto; }'
            + '.pdf-header__title { font-size: 20px; font-weight: 800; line-height: 1.2; margin: 0 0 4px; }'
            + '.pdf-header__subtitle { font-size: 11px; margin: 0; ' + subtitleColor + ' }'
            + '.pdf-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }'
            + '.pdf-meta__card { flex: 1 1 140px; background: #fff; border: 1px solid #dbe4f0; border-radius: 10px; padding: 8px 10px; }'
            + '.pdf-meta__label { display: flex; align-items: center; gap: 6px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 4px; font-weight: 700; }'
            + '.pdf-meta__label svg { flex: 0 0 auto; }'
            + '.pdf-meta__value { font-size: 12px; font-weight: 700; color: #0f172a; }'
            + '.pdf-table-wrap { background: #fff; border: 1px solid #dbe4f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); }'
            + '.pdf-table-wrap table { width: 100%; border-collapse: collapse; table-layout: auto; font-size: ' + tableFontSize + '; }'
            + '.pdf-table-wrap thead th { background: ' + thBg + '; color: ' + thColor + '; font-weight: 800; text-align: center; padding: ' + thPadding + '; border: 1px solid ' + thBorder + '; vertical-align: middle; white-space: nowrap; }'
            + '.pdf-table-wrap thead tr:nth-child(2) th { background: ' + th2Bg + '; color: ' + (isGray ? '#64748b' : thColor) + '; }'
            + '.pdf-table-wrap tbody td { padding: ' + tdPadding + '; border: 1px solid #e2e8f0; vertical-align: middle; color: #0f172a; white-space: nowrap; }'
            + '.pdf-table-wrap tbody tr:nth-child(even):not(.vm-uwc-row-total):not(.vm-ai-row-total):not(.vm-adb-row-total) td { background: #f8fafc; }'
            + '.pdf-table-wrap tbody td.vm-uwc-num, .pdf-table-wrap tbody td.vm-ai-num, .pdf-table-wrap tbody td.vm-adb-num { text-align: right; font-variant-numeric: tabular-nums; }'
            + '.pdf-table-wrap tbody td.vm-uwc-text, .pdf-table-wrap tbody td.vm-ai-text, .pdf-table-wrap tbody td.vm-adb-text { text-align: left; white-space: normal; }'
            + '.pdf-table-wrap tbody tr.vm-uwc-row-total td, .pdf-table-wrap tbody tr.vm-ai-row-total td, .pdf-table-wrap tbody tr.vm-adb-row-total td { background: ' + totalBg + ' !important; color: ' + totalColor + ' !important; font-weight: 800; border-top: 2px solid ' + totalBorder + '; }'
            + '.pdf-table-wrap tbody tr.vm-ai-row-negative td { background: #dc2626 !important; color: #fff !important; font-weight: 700; }'
            + '.pdf-table-wrap tbody tr.vm-opr-table-empty-row td { text-align: center; padding: 28px 16px; color: #64748b; font-weight: 600; background: #f8fafc; white-space: normal; }'
            + '.pdf-table-wrap .vm-ai-head-badge { display: inline-block; padding: 2px 6px; border-radius: 999px; font-size: 6.5px; font-weight: 700; text-transform: uppercase; color: #fff; background: #2563eb; }'
            + '.pdf-table-wrap .vm-ai-head-badge--rate { background: #16a34a; }'
            + '.pdf-table-wrap .vm-ai-head-badge--pct { background: #64748b; }'
            + '.pdf-table-wrap .vm-ai-head-badge--comm { background: #0ea5e9; }'
            + '.pdf-table-wrap .vm-ai-head-badge--income { background: #2563eb; }'
            + '.pdf-table-wrap .vm-ai-head-badge--success { background: #16a34a; }'
            + '.pdf-footer { margin-top: 10px; padding: 8px 4px 0; font-size: 9px; color: #64748b; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }'
            + '.pdf-footer strong { color: #334155; }'
            + '@media print { html, body { background: #fff; } .pdf-shell { padding: 0; } .pdf-header, .pdf-meta__card, .pdf-table-wrap { box-shadow: none; } }';
    }

    window.openAdminModernReportPdf = function (options) {
        options = options || {};

        var sourceTable = options.table;
        var exportData = options.data || null;
        if (!sourceTable && !exportData) {
            return false;
        }

        var title = sanitizeExportText(options.title || 'Report');
        var subtitle = sanitizeExportText(options.subtitle || 'AashaDigitalIndia24 - Admin Report');
        var fromDate = sanitizeExportText(options.fromDate || '-');
        var toDate = sanitizeExportText(options.toDate || '-');
        var orientation = options.orientation === 'landscape' ? 'landscape' : 'portrait';
        var cloneHtml;
        var rowCount;

        if (exportData) {
            cloneHtml = buildTableHtmlFromData(exportData);
            rowCount = typeof options.recordCount === 'number' ? options.recordCount : exportData.rows.length;
        } else {
            cloneHtml = prepareTableClone(sourceTable).outerHTML;
            rowCount = typeof options.recordCount === 'number' ? options.recordCount : countDataRows(prepareTableClone(sourceTable));
        }
        var recordLabel = options.recordLabel || (rowCount + ' record' + (rowCount === 1 ? '' : 's'));
        var printWin = window.open('', '_blank');

        if (!printWin) {
            window.alert('Please allow pop-ups to export PDF.');
            return false;
        }

        var styles = getModernPdfStyles(orientation, options.theme);
        var html = ''
            + '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />'
            + '<title>' + escapeHtml(title) + '</title>'
            + '<style>' + styles + '</style></head><body>'
            + '<div class="pdf-shell">'
            + '<header class="pdf-header">'
            + '<div class="pdf-header__brand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>AashaDigitalIndia24</div>'
            + '<h1 class="pdf-header__title">' + escapeHtml(title) + '</h1>'
            + '<p class="pdf-header__subtitle">' + escapeHtml(subtitle) + '</p>'
            + '</header>'
            + '<div class="pdf-meta">'
            + '<div class="pdf-meta__card"><span class="pdf-meta__label">' + getPdfMetaIcon('from') + 'From Date</span><span class="pdf-meta__value">' + formatPrintDate(fromDate) + '</span></div>'
            + '<div class="pdf-meta__card"><span class="pdf-meta__label">' + getPdfMetaIcon('to') + 'To Date</span><span class="pdf-meta__value">' + formatPrintDate(toDate) + '</span></div>'
            + '<div class="pdf-meta__card"><span class="pdf-meta__label">' + getPdfMetaIcon('generated') + 'Generated</span><span class="pdf-meta__value">' + escapeHtml(formatGeneratedAt()) + '</span></div>'
            + '<div class="pdf-meta__card"><span class="pdf-meta__label">' + getPdfMetaIcon('records') + 'Records</span><span class="pdf-meta__value">' + escapeHtml(recordLabel) + '</span></div>'
            + '</div>'
            + '<div class="pdf-table-wrap">' + cloneHtml + '</div>'
            + '<footer class="pdf-footer">'
            + '<span><strong>Confidential</strong> — For internal business use only.</span>'
            + '<span>Printed via Admin Portal</span>'
            + '</footer>'
            + '</div>'
            + '<script>window.onload=function(){window.focus();window.print();};<\/script>'
            + '</body></html>';

        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        return true;
    };
}(window));
