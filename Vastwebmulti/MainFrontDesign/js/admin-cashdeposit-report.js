/**
 * ADMIN — Cash Deposit Report page UI v=2
 */
(function (window, document, $) {
    'use strict';

    var PAGE_SELECTOR = '.saas-cashdeposit-report-page';

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
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

    window.answers = function () {
        var answer = $('#ddlusers').val();
        $('#allmaster,#dlm,#rem').hide();
        if (answer === 'Dealer') {
            $('#dlm').show();
        } else if (answer === 'Master') {
            $('#allmaster').show();
        } else if (answer === 'Retailer') {
            $('#rem').show();
        }
    };

    window.hideCashDepositTotals = function () {
        var $panel = $('#cashDepositTotalsPanel');
        var $btn = $('.vm-cashdeposit-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    window.findtotalCashDeposit = function () {
        if (!$) {
            return;
        }
        var $panel = $('#cashDepositTotalsPanel');
        var $btn = $('.vm-cashdeposit-totals-btn');

        if ($panel.hasClass('is-open')) {
            hideCashDepositTotals();
            return;
        }

        $.post(window.cashDepositTotalsUrl || '', {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            ddlusers: $('#ddlusers').val(),
            ddl_status: $('#ddl_status').val(),
            allmaster1: $('#allmaster1').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || ''
        }, function (data) {
            $('#successtotal').text('₹ ' + (data.success || '0'));
            $('#Failedtotal').text('₹ ' + (data.failed || '0'));
            $('#Pendingtotal').text('₹ ' + (data.pending || '0'));
            $panel.addClass('is-open').show().attr('aria-hidden', 'false');
            $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
        });
    };

    function init() {
        if (!$) {
            return;
        }
        if (window.answers) {
            answers();
        }
        renumberSrRows();
        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmCashDepositReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });
    }

    window.vmCashDepositRenumberSr = renumberSrRows;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
