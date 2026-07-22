/* Shared modern Excel export for admin report pages */
(function (window) {
    'use strict';

    var TOTAL_ROW_CLASSES = ['vm-adb-row-total', 'vm-uwc-row-total', 'vm-ai-row-total', 'vm-opr-row-total'];
    var EMPTY_ROW_CLASSES = ['vm-opr-table-empty-row', 'bi-empty-row'];

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

    function isTotalRow(row) {
        var i;
        var firstCell;
        for (i = 0; i < TOTAL_ROW_CLASSES.length; i++) {
            if (row.classList.contains(TOTAL_ROW_CLASSES[i])) {
                return true;
            }
        }
        firstCell = row.querySelector('td');
        if (firstCell && /^total$/i.test(getCellText(firstCell))) {
            return true;
        }
        return false;
    }

    function isEmptyRow(row) {
        var i;
        if (row.querySelector('.no-data-found-img, img[src*="NoDatall"]')) {
            return true;
        }
        for (i = 0; i < EMPTY_ROW_CLASSES.length; i++) {
            if (row.classList.contains(EMPTY_ROW_CLASSES[i])) {
                return true;
            }
        }
        return false;
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

    function getCellText(cell) {
        if (!cell) {
            return '';
        }
        return (cell.innerText || cell.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function collectTableData(sourceTable) {
        var headers = [];
        var rows = [];
        var headerCells = sourceTable.querySelectorAll('thead th');
        var bodyRows = sourceTable.querySelectorAll('tbody tr');
        var i;
        var r;
        var c;
        var cells;
        var rowData;
        var rowMeta;

        for (i = 0; i < headerCells.length; i++) {
            headers.push(getCellText(headerCells[i]));
        }

        for (r = 0; r < bodyRows.length; r++) {
            if (isEmptyRow(bodyRows[r])) {
                continue;
            }

            cells = bodyRows[r].querySelectorAll('td');
            rowData = [];
            for (c = 0; c < cells.length; c++) {
                rowData.push(getCellText(cells[c]));
            }

            if (!rowData.length) {
                continue;
            }

            rowMeta = { isTotal: isTotalRow(bodyRows[r]) };
            rows.push({ cells: rowData, meta: rowMeta });
        }

        return { headers: headers, rows: rows };
    }

    function countDataRows(rows) {
        var count = 0;
        var i;
        for (i = 0; i < rows.length; i++) {
            if (!rows[i].meta.isTotal) {
                count++;
            }
        }
        return count;
    }

    function getMetaColSpans(colCount, fieldCount) {
        var spans = [];
        var base;
        var remainder;
        var i;

        fieldCount = fieldCount || 4;
        colCount = Math.max(colCount, fieldCount);
        base = Math.floor(colCount / fieldCount);
        remainder = colCount % fieldCount;

        for (i = 0; i < fieldCount; i++) {
            spans.push(base + (i < remainder ? 1 : 0));
        }

        return spans;
    }

    function buildExcelColgroupHtml(colCount, headers) {
        var html = '<colgroup>';
        var i;
        var w;
        var label;

        for (i = 0; i < colCount; i++) {
            label = headers && headers[i] ? String(headers[i]).toLowerCase() : '';
            if (label.indexOf('message') >= 0 || label.indexOf('template') >= 0 || label.indexOf('response') >= 0 || label.indexOf('api') >= 0) {
                w = 260;
            } else if (label.indexOf('date') >= 0 || label.indexOf('time') >= 0) {
                w = 150;
            } else if (i === 0) {
                w = 130;
            } else {
                w = 120;
            }
            html += '<col width="' + w + '" style="width:' + w + 'px;mso-width-source:userset;" />';
        }

        html += '</colgroup>';
        return html;
    }

    function getExcelTableWidth(colCount, headers) {
        var total = 0;
        var i;
        var w;
        var label;

        for (i = 0; i < colCount; i++) {
            label = headers && headers[i] ? String(headers[i]).toLowerCase() : '';
            if (label.indexOf('message') >= 0 || label.indexOf('template') >= 0 || label.indexOf('response') >= 0 || label.indexOf('api') >= 0) {
                w = 260;
            } else if (label.indexOf('date') >= 0 || label.indexOf('time') >= 0) {
                w = 150;
            } else if (i === 0) {
                w = 130;
            } else {
                w = 120;
            }
            total += w;
        }

        return Math.max(total, 720);
    }

    function buildExcelDocumentHtml(options, data) {
        var title = sanitizeExportText(options.title || 'Report');
        var subtitle = sanitizeExportText(options.subtitle || 'AashaDigitalIndia24 - Admin Report');
        var fromDate = sanitizeExportText(options.fromDate || '-');
        var toDate = sanitizeExportText(options.toDate || '-');
        var generatedAt = options.generatedAt || formatGeneratedAt();
        var rowCount = typeof options.recordCount === 'number' ? options.recordCount : countDataRows(data.rows);
        var sheetName = options.sheetName || 'Report';
        var colCount = Math.max(data.headers.length || 1, 4);
        var metaSpans = getMetaColSpans(colCount, 4);
        var tableWidth = getExcelTableWidth(colCount, data.headers);
        var i;
        var r;
        var c;
        var dataRowIndex;
        var cellStyle;
        var rowBg;
        var html;
        var metaFields = [
            { label: 'From Date', value: fromDate },
            { label: 'To Date', value: toDate },
            { label: 'Generated', value: generatedAt },
            { label: 'Records', value: String(rowCount) }
        ];

        var heroStyle = 'background-color:#1e3a8a;color:#ffffff;font-size:18px;font-weight:bold;padding:14px 16px;font-family:Segoe UI,Arial,Helvetica,sans-serif;';
        var brandStyle = 'display:block;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;margin-bottom:4px;font-weight:normal;';
        var subStyle = 'font-size:11px;font-weight:normal;color:#ffffff;margin:4px 0 0;';
        var metaCellStyle = 'padding:10px 12px;border:1px solid #dbe4f0;background-color:#f8fafc;font-family:Segoe UI,Arial,Helvetica,sans-serif;vertical-align:top;';
        var metaLabelStyle = 'display:block;font-size:9px;font-weight:bold;text-transform:uppercase;color:#64748b;margin-bottom:2px;';
        var metaValueStyle = 'font-size:11px;font-weight:bold;color:#0f172a;';
        var thStyle = 'background-color:#1e3a8a;color:#ffffff;padding:10px 8px;font-size:9px;font-weight:bold;text-transform:uppercase;border:1px solid #1d4ed8;font-family:Segoe UI,Arial,Helvetica,sans-serif;text-align:center;';
        var tdStyle = 'padding:9px 8px;border:1px solid #e2e8f0;color:#0f172a;font-size:10px;font-family:Segoe UI,Arial,Helvetica,sans-serif;background-color:#ffffff;';
        var tdAltStyle = 'padding:9px 8px;border:1px solid #e2e8f0;color:#0f172a;font-size:10px;font-family:Segoe UI,Arial,Helvetica,sans-serif;background-color:#f8fafc;';
        var tdTotalStyle = 'padding:10px 8px;border:1px solid #93c5fd;color:#1e3a8a;font-size:10px;font-weight:bold;font-family:Segoe UI,Arial,Helvetica,sans-serif;background-color:#dbeafe;';
        var footerStyle = 'padding:10px 12px;border-top:1px dashed #dbe2ea;color:#94a3b8;font-size:9px;text-align:center;font-family:Segoe UI,Arial,Helvetica,sans-serif;';

        html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">'
            + '<head><meta charset="utf-8">'
            + '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>'
            + '<x:Name>' + escapeHtml(sheetName) + '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>'
            + '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->'
            + '</head><body>';

        html += '<table border="0" cellpadding="0" cellspacing="0" width="' + tableWidth + '" style="border-collapse:collapse;table-layout:fixed;width:' + tableWidth + 'px;">';
        html += buildExcelColgroupHtml(colCount, data.headers);

        html += '<tr><td colspan="' + colCount + '" bgcolor="#1e3a8a" style="' + heroStyle + '">'
            + '<span style="' + brandStyle + '">&#9889; AashaDigitalIndia24</span>'
            + escapeHtml(title)
            + '<br/><span style="' + subStyle + '">' + escapeHtml(subtitle) + '</span></td></tr>';

        html += '<tr bgcolor="#f8fafc">';
        for (i = 0; i < metaFields.length; i++) {
            html += '<td colspan="' + metaSpans[i] + '" style="' + metaCellStyle + '"><span style="' + metaLabelStyle + '">' + metaFields[i].label + '</span><span style="' + metaValueStyle + '">' + escapeHtml(metaFields[i].value) + '</span></td>';
        }
        html += '</tr>';

        if (data.headers.length) {
            html += '<tr>';
            for (i = 0; i < data.headers.length; i++) {
                html += '<th bgcolor="#1e3a8a" style="' + thStyle + '">' + escapeHtml(data.headers[i]) + '</th>';
            }
            html += '</tr>';
        }

        if (!data.rows.length) {
            html += '<tr><td colspan="' + colCount + '" bgcolor="#f8fafc" style="padding:28px 16px;text-align:center;color:#64748b;font-size:12px;font-weight:bold;background-color:#f8fafc;border:1px solid #e2e8f0;">No data found.</td></tr>';
        } else {
            dataRowIndex = 0;
            for (r = 0; r < data.rows.length; r++) {
                if (data.rows[r].meta.isTotal) {
                    html += '<tr bgcolor="#dbeafe">';
                    for (c = 0; c < data.rows[r].cells.length; c++) {
                        html += '<td style="' + tdTotalStyle + '">' + escapeHtml(data.rows[r].cells[c]) + '</td>';
                    }
                    html += '</tr>';
                    continue;
                }

                cellStyle = dataRowIndex % 2 === 0 ? tdStyle : tdAltStyle;
                rowBg = dataRowIndex % 2 === 1 ? ' bgcolor="#f8fafc"' : '';
                html += '<tr' + rowBg + '>';
                for (c = 0; c < data.rows[r].cells.length; c++) {
                    html += '<td style="' + cellStyle + '">' + escapeHtml(data.rows[r].cells[c]) + '</td>';
                }
                html += '</tr>';
                dataRowIndex++;
            }
        }

        html += '<tr><td colspan="' + colCount + '" style="' + footerStyle + '">'
            + '<strong style="color:#334155;">Confidential</strong> - For internal business use only. - '
            + escapeHtml(title) + ' - ' + escapeHtml(generatedAt) + '</td></tr>';
        html += '</table></body></html>';

        return html;
    }

    function countLeafColumns(table) {
        var cols = table.querySelectorAll('colgroup col');
        var total = 0;
        var i;
        var ths;
        var firstRow;

        if (cols.length) {
            for (i = 0; i < cols.length; i++) {
                total += parseInt(cols[i].getAttribute('span') || '1', 10) || 1;
            }
            if (total > 0) {
                return total;
            }
        }

        firstRow = table.querySelector('thead tr');
        if (!firstRow) {
            return 1;
        }
        ths = firstRow.querySelectorAll('th');
        total = 0;
        for (i = 0; i < ths.length; i++) {
            total += parseInt(ths[i].getAttribute('colspan') || '1', 10) || 1;
        }
        return total || 1;
    }

    function ensureExcelColgroup(tableClone, leafCount) {
        var oldGroups = tableClone.querySelectorAll('colgroup');
        var i;
        var colgroup;
        var col;
        var firmWidth = 180;
        var numWidth = 110;

        for (i = oldGroups.length - 1; i >= 0; i--) {
            if (oldGroups[i].parentNode) {
                oldGroups[i].parentNode.removeChild(oldGroups[i]);
            }
        }

        colgroup = document.createElement('colgroup');
        for (i = 0; i < leafCount; i++) {
            col = document.createElement('col');
            if (i === 0) {
                col.setAttribute('width', String(firmWidth));
                col.setAttribute('style', 'width:' + firmWidth + 'px;mso-width-source:userset;');
            } else {
                col.setAttribute('width', String(numWidth));
                col.setAttribute('style', 'width:' + numWidth + 'px;mso-width-source:userset;');
            }
            colgroup.appendChild(col);
        }

        if (tableClone.firstChild) {
            tableClone.insertBefore(colgroup, tableClone.firstChild);
        } else {
            tableClone.appendChild(colgroup);
        }
    }

    function cleanExcelHeaderText(cell) {
        var text = getCellText(cell);
        cell.innerHTML = '';
        cell.appendChild(document.createTextNode(text));
    }

    function styleClonedTableForExcel(tableClone, theme) {
        var isGray = theme === 'gray';
        var thBg = isGray ? '#E2E8F0' : '#1e3a8a';
        var thColor = isGray ? '#1E293B' : '#ffffff';
        var thBorder = isGray ? '#CBD5E1' : '#1d4ed8';
        var th2Bg = isGray ? '#F1F5F9' : '#1e40af';
        var th2Color = isGray ? '#334155' : '#ffffff';
        var thStyle = 'background-color:' + thBg + ';color:' + thColor + ';padding:10px 8px;font-size:11px;font-weight:bold;border:1px solid ' + thBorder + ';font-family:Arial,Helvetica,sans-serif;text-align:center;vertical-align:middle;white-space:nowrap;mso-number-format:\\@;';
        var th2Style = 'background-color:' + th2Bg + ';color:' + th2Color + ';padding:8px 6px;font-size:10px;font-weight:bold;border:1px solid ' + thBorder + ';font-family:Arial,Helvetica,sans-serif;text-align:center;vertical-align:middle;white-space:nowrap;mso-number-format:\\@;';
        var tdStyle = 'padding:8px 8px;border:1px solid #E2E8F0;color:#0F172A;font-size:10px;font-family:Arial,Helvetica,sans-serif;background-color:#FFFFFF;vertical-align:middle;white-space:nowrap;';
        var tdTextStyle = 'padding:8px 8px;border:1px solid #E2E8F0;color:#0F172A;font-size:10px;font-family:Arial,Helvetica,sans-serif;background-color:#FFFFFF;vertical-align:middle;text-align:left;white-space:nowrap;';
        var tdTotalStyle = isGray
            ? 'padding:9px 8px;border:1px solid #CBD5E1;color:#1E293B;font-size:10px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;background-color:#E2E8F0;vertical-align:middle;white-space:nowrap;'
            : 'padding:9px 8px;border:1px solid #93c5fd;color:#1e3a8a;font-size:10px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;background-color:#dbeafe;vertical-align:middle;white-space:nowrap;';
        var emptyStyle = 'padding:24px 16px;border:1px solid #E2E8F0;text-align:center;color:#64748B;font-size:12px;font-weight:bold;background-color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;';
        var totalBg = isGray ? '#E2E8F0' : '#dbeafe';
        var leafCount = countLeafColumns(tableClone);
        var headerRows = tableClone.querySelectorAll('thead tr');
        var bodyRows = tableClone.querySelectorAll('tbody tr');
        var i;
        var r;
        var c;
        var cells;
        var headers;
        var colspan;
        var cellWidth;

        ensureExcelColgroup(tableClone, leafCount);

        for (r = 0; r < headerRows.length; r++) {
            headers = headerRows[r].querySelectorAll('th');
            for (i = 0; i < headers.length; i++) {
                cleanExcelHeaderText(headers[i]);
                colspan = parseInt(headers[i].getAttribute('colspan') || '1', 10) || 1;
                cellWidth = (r === 0 && i === 0) ? 180 : (110 * colspan);
                headers[i].setAttribute('bgcolor', r === 0 ? thBg : th2Bg);
                headers[i].setAttribute('width', String(cellWidth));
                headers[i].setAttribute('style', (r === 0 ? thStyle : th2Style) + 'width:' + cellWidth + 'px;');
                if (r === 0 && i === 0) {
                    headers[i].style.textAlign = 'left';
                    headers[i].setAttribute('align', 'left');
                }
            }
        }

        for (r = 0; r < bodyRows.length; r++) {
            if (isEmptyRow(bodyRows[r])) {
                cells = bodyRows[r].querySelectorAll('td, th');
                for (c = 0; c < cells.length; c++) {
                    cells[c].innerHTML = 'No data found.';
                    cells[c].setAttribute('bgcolor', '#F8FAFC');
                    cells[c].setAttribute('align', 'center');
                    cells[c].setAttribute('style', emptyStyle);
                }
                continue;
            }
            cells = bodyRows[r].querySelectorAll('td, th');
            for (c = 0; c < cells.length; c++) {
                if (isTotalRow(bodyRows[r])) {
                    cells[c].setAttribute('bgcolor', totalBg);
                    cells[c].setAttribute('style', tdTotalStyle + (c === 0 ? 'text-align:left;' : 'text-align:right;'));
                    cells[c].setAttribute('align', c === 0 ? 'left' : 'right');
                } else if (c === 0) {
                    cells[c].setAttribute('bgcolor', r % 2 === 1 ? '#F8FAFC' : '#FFFFFF');
                    cells[c].setAttribute('style', tdTextStyle + (r % 2 === 1 ? 'background-color:#F8FAFC;' : ''));
                    cells[c].setAttribute('align', 'left');
                } else if (r % 2 === 1) {
                    cells[c].setAttribute('bgcolor', '#F8FAFC');
                    cells[c].setAttribute('style', tdStyle + 'background-color:#F8FAFC;text-align:right;');
                    cells[c].setAttribute('align', 'right');
                } else {
                    cells[c].setAttribute('bgcolor', '#FFFFFF');
                    cells[c].setAttribute('style', tdStyle + 'text-align:right;');
                    cells[c].setAttribute('align', 'right');
                }
            }
        }

        tableClone.removeAttribute('class');
        tableClone.removeAttribute('id');
        tableClone.setAttribute('border', '1');
        tableClone.setAttribute('cellpadding', '0');
        tableClone.setAttribute('cellspacing', '0');
        tableClone.setAttribute('width', String(Math.max(leafCount * 110 + 70, 1200)));
        tableClone.setAttribute('style', 'border-collapse:collapse;table-layout:fixed;width:' + (Math.max(leafCount * 110 + 70, 1200)) + 'px;');
        return tableClone;
    }

    function buildExcelCloneDocumentHtml(options, sourceTable) {
        var title = sanitizeExportText(options.title || 'Report');
        var subtitle = sanitizeExportText(options.subtitle || 'AashaDigitalIndia24 - Admin Report');
        var fromDate = sanitizeExportText(options.fromDate || '-');
        var toDate = sanitizeExportText(options.toDate || '-');
        var generatedAt = options.generatedAt || formatGeneratedAt();
        var rowCount = typeof options.recordCount === 'number' ? options.recordCount : 0;
        var sheetName = options.sheetName || 'Report';
        var isGray = options.theme === 'gray';
        var leafCount = countLeafColumns(sourceTable);
        var colCount = Math.max(leafCount, 4);
        var metaSpans = getMetaColSpans(colCount, 4);
        var tableClone = styleClonedTableForExcel(sourceTable.cloneNode(true), options.theme);
        var headerLabels = [];
        var headerCells = sourceTable.querySelectorAll('thead th');
        var theadHtml = '';
        var tbodyHtml = '';
        var theadNode = tableClone.querySelector('thead');
        var tbodyNode = tableClone.querySelector('tbody');
        var tableWidth;
        var heroBg = isGray ? '#E2E8F0' : '#1e3a8a';
        var heroColor = isGray ? '#0F172A' : '#ffffff';
        var heroStyle = 'background-color:' + heroBg + ';color:' + heroColor + ';font-size:18px;font-weight:bold;padding:14px 16px;font-family:Arial,Helvetica,sans-serif;border:1px solid #CBD5E1;';
        var brandStyle = 'display:block;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;font-weight:normal;color:' + (isGray ? '#64748B' : '#ffffff') + ';';
        var subStyle = 'font-size:11px;font-weight:normal;color:' + (isGray ? '#475569' : '#ffffff') + ';margin:4px 0 0;';
        var metaCellStyle = 'padding:10px 12px;border:1px solid #E2E8F0;background-color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;vertical-align:top;';
        var metaLabelStyle = 'display:block;font-size:9px;font-weight:bold;text-transform:uppercase;color:#64748B;margin-bottom:3px;';
        var metaValueStyle = 'font-size:12px;font-weight:bold;color:#0F172A;';
        var footerStyle = 'padding:12px;border-top:1px dashed #CBD5E1;color:#94A3B8;font-size:9px;text-align:center;font-family:Arial,Helvetica,sans-serif;';
        var metaFields = [
            { label: 'From Date', value: fromDate },
            { label: 'To Date', value: toDate },
            { label: 'Generated', value: generatedAt },
            { label: 'Records', value: String(rowCount) }
        ];
        var html;
        var i;

        for (i = 0; i < headerCells.length; i++) {
            headerLabels.push(getCellText(headerCells[i]));
        }
        tableWidth = getExcelTableWidth(colCount, headerLabels);

        if (theadNode) {
            theadHtml = theadNode.innerHTML;
        }
        if (tbodyNode) {
            tbodyHtml = tbodyNode.innerHTML;
        }

        html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">'
            + '<head><meta charset="utf-8">'
            + '<style type="text/css">'
            + 'table { border-collapse: collapse; }'
            + 'th, td { font-family: Arial, Helvetica, sans-serif; }'
            + '</style>'
            + '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>'
            + '<x:Name>' + escapeHtml(sheetName) + '</x:Name>'
            + '<x:WorksheetOptions><x:DisplayGridlines/><x:FitToPage/><x:FitWidth>1</x:FitWidth><x:FitHeight>0</x:FitHeight></x:WorksheetOptions>'
            + '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->'
            + '</head><body>';

        html += '<table border="0" cellpadding="0" cellspacing="0" width="' + tableWidth + '" style="border-collapse:collapse;table-layout:fixed;width:' + tableWidth + 'px;">';
        html += buildExcelColgroupHtml(colCount, headerLabels);

        html += '<tr><td colspan="' + colCount + '" bgcolor="' + heroBg + '" style="' + heroStyle + '">'
            + '<span style="' + brandStyle + '">AashaDigitalIndia24</span>'
            + escapeHtml(title)
            + '<br/><span style="' + subStyle + '">' + escapeHtml(subtitle) + '</span></td></tr>';

        html += '<tr bgcolor="#F8FAFC">';
        for (i = 0; i < metaFields.length; i++) {
            html += '<td colspan="' + metaSpans[i] + '" style="' + metaCellStyle + '"><span style="' + metaLabelStyle + '">' + metaFields[i].label + '</span><span style="' + metaValueStyle + '">' + escapeHtml(metaFields[i].value) + '</span></td>';
        }
        html += '</tr>';

        if (theadHtml) {
            html += '<thead>' + theadHtml + '</thead>';
        }
        if (tbodyHtml) {
            html += '<tbody>' + tbodyHtml + '</tbody>';
        } else {
            html += '<tbody><tr><td colspan="' + colCount + '" bgcolor="#F8FAFC" style="padding:24px 16px;text-align:center;color:#64748B;font-size:12px;font-weight:bold;background-color:#F8FAFC;border:1px solid #E2E8F0;">No data found.</td></tr></tbody>';
        }

        html += '<tr><td colspan="' + colCount + '" style="' + footerStyle + '">'
            + '<strong style="color:#334155;">Confidential</strong> - For internal business use only. - '
            + escapeHtml(title) + ' - ' + escapeHtml(generatedAt) + '</td></tr>';
        html += '</table></body></html>';

        return html;
    }

    window.openAdminModernReportExcel = function (options) {
        options = options || {};

        var sourceTable = options.table;
        var exportData = options.data || null;
        if (!sourceTable && !exportData) {
            return false;
        }

        var excelHtml;
        if (exportData) {
            excelHtml = buildExcelDocumentHtml(options, exportData);
        } else if (options.mode === 'clone') {
            excelHtml = buildExcelCloneDocumentHtml(options, sourceTable);
        } else {
            excelHtml = buildExcelDocumentHtml(options, collectTableData(sourceTable));
        }
        var stamp = new Date().toISOString().slice(0, 10);
        var filePrefix = options.filePrefix || 'Report';
        var blob = new Blob(['\ufeff', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        var link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = filePrefix + '_' + stamp + '.xls';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        return true;
    };
}(window));
