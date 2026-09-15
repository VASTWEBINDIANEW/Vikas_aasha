/**
 * ADMIN — Micro ATM Report page UI v=2
 */
(function (window, document, $) {
    'use strict';

    var PAGE_SELECTOR = '.saas-microatm-report-page';

    function enhanceLoader() {
        var $loader = $('#loadingdiv');
        if ($loader.length && !$loader.find('.vm-dmt-loading-text').length) {
            $loader.append('<div class="vm-dmt-loading-text">Loading transactions…</div>');
        }
    }

    function renumberSrRows() {
        $('#trow tr').not('.vm-opr-table-empty-row').each(function (index) {
            var $num = $(this).find('.vm-dmt-sr-num').first();
            if ($num.length) {
                $num.text(index + 1);
            }
        });
    }

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
        }
    }

    window.answers = function () {
        var answer = $('#ddlusers').val();
        $('#allwhitelabel,#allmaster,#dlm,#rem').hide();
        if (answer === 'Dealer') { $('#dlm').show(); }
        else if (answer === 'Whitelabel') { $('#allwhitelabel').show(); }
        else if (answer === 'Master') { $('#allmaster').show(); }
        else if (answer === 'Retailer') { $('#rem').show(); }
    };

    function formatMicroAtmTotal(val) {
        var num = parseFloat(val);
        if (isNaN(num)) {
            return '\u20B9 0.00';
        }
        return '\u20B9 ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    window.hideMicroAtmTotals = function () {
        var $panel = $('#microAtmTotalsPanel');
        var $btn = $('.vm-microatm-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    function parseMicroAtmAmount(text) {
        var cleaned = String(text || '').replace(/[^\d.-]/g, '');
        var num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    function computeMicroAtmTotalsFromTable() {
        var totals = { success: 0, failed: 0, pending: 0 };

        $('#trow tr.vm-dmt-row').each(function () {
            var $row = $(this);
            var amount = parseMicroAtmAmount($row.find('td.vm-dmt-amt-cell').first().text());

            if ($row.hasClass('vm-dmt-row--success')) {
                totals.success += amount;
            } else if ($row.hasClass('vm-dmt-row--failed')) {
                totals.failed += amount;
            } else if ($row.hasClass('vm-dmt-row--pending')) {
                totals.pending += amount;
            }
        });

        return totals;
    }

    window.findtotalMicroAtm = function () {
        if (!$) {
            return;
        }
        var $panel = $('#microAtmTotalsPanel');
        var $btn = $('.vm-microatm-totals-btn');

        if ($panel.hasClass('is-open')) {
            hideMicroAtmTotals();
            return;
        }

        var totals = computeMicroAtmTotalsFromTable();
        $('#successtotal').text(formatMicroAtmTotal(totals.success));
        $('#Failedtotal').text(formatMicroAtmTotal(totals.failed));
        $('#Pendingtotal').text(formatMicroAtmTotal(totals.pending));
        $panel.addClass('is-open').show().attr('aria-hidden', 'false');
        $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
    };

    function bindTableRefresh() {
        if (!$) {
            return;
        }
        renumberSrRows();
        $(document).ajaxComplete(function (_evt, _xhr, settings) {
            var url = (settings && settings.url) ? String(settings.url) : '';
            if (url.indexOf('InfiniteScroll_MicroAtm') !== -1) {
                renumberSrRows();
            }
        });
    }

    function init() {
        if (!$) {
            return;
        }
        enhanceLoader();
        bindTableRefresh();
        if (window.answers) {
            answers();
        }
        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmMicroAtmReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });
    }

    window.vmMicroAtmRenumberSr = renumberSrRows;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
