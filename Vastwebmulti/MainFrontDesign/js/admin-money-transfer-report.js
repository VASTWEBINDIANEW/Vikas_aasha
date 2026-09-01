/**
 * ADMIN — Money_Transfer_Report page UI v=13
 */
(function (window, document, $) {
    'use strict';

    var PAGE_SELECTOR = '.saas-dmt-report-page';

    function renumberSrRows() {
        $('#trow tr').not('.vm-opr-table-empty-row').each(function (index) {
            var $num = $(this).find('.vm-dmt-sr-num').first();
            if ($num.length) {
                $num.text(index + 1);
            }
        });
    }

    function refreshDmtSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
            return;
        }
        if (typeof window.refreshAdminSelect2 === 'function') {
            window.refreshAdminSelect2($(PAGE_SELECTOR));
        }
    }

    function bindTableRefresh() {
        if (!$) {
            return;
        }
        renumberSrRows();
        $(document).ajaxComplete(function (_evt, _xhr, settings) {
            var url = (settings && settings.url) ? String(settings.url) : '';
            if (url.indexOf('InfiniteScroll1') !== -1) {
                renumberSrRows();
            }
        });
    }

    function bindResendActions() {
        if (!$) {
            return;
        }
        $(document).off('click.vmDmtResend', '.saas-dmt-report-page .vm-dmt-act-btn--info[data-resend-id]');
        $(document).on('click.vmDmtResend', '.saas-dmt-report-page .vm-dmt-act-btn--info[data-resend-id]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var idno = $(this).attr('data-resend-id');
            var dmtType = $(this).attr('data-dmt-type') || 'DMT2';
            if (!idno) {
                return;
            }
            if (typeof window.confirmMoneyResend === 'function') {
                window.confirmMoneyResend(idno, dmtType);
            }
        });
    }

    function init() {
        if (!$) {
            return;
        }
        bindTableRefresh();
        bindResendActions();
        window.setTimeout(refreshDmtSelects, 400);
        $(window).on('load', function () {
            window.setTimeout(refreshDmtSelects, 200);
        });
    }

    window.vmDmtRenumberSr = renumberSrRows;
    window.vmDmtInitSelects = refreshDmtSelects;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
