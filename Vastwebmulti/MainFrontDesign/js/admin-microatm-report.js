/**
 * ADMIN — Micro ATM Report page UI v=1
 */
(function (window, document, $) {
    'use strict';

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

    function initSelect2() {
        if (!$ || !$.fn.select2) {
            return;
        }
        var $targets = $('.saas-microatm-report-page #allwhitelabel1, .saas-microatm-report-page #allmaster2, .saas-microatm-report-page #alldealer, .saas-microatm-report-page #allretailer');
        $targets.each(function () {
            var $el = $(this);
            if ($el.data('select2')) {
                $el.select2('destroy');
            }
            $el.select2({
                width: '100%',
                dropdownAutoWidth: false,
                minimumResultsForSearch: 6
            });
        });
    }

    window.answers = function () {
        var answer = $('#ddlusers').val();
        $('#allwhitelabel,#allmaster,#dlm,#rem').hide();
        if (answer === 'Dealer') { $('#dlm').show(); }
        else if (answer === 'Whitelabel') { $('#allwhitelabel').show(); }
        else if (answer === 'Master') { $('#allmaster').show(); }
        else if (answer === 'Retailer') { $('#rem').show(); }
    };

    window.hideMicroAtmTotals = function () {
        var $panel = $('#microAtmTotalsPanel');
        var $btn = $('.vm-microatm-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

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

        $.post(window.microAtmTotalsUrl || '', {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            ddlusers: $('#ddlusers').val(),
            ddl_status: $('#ddl_status').val(),
            allmaster: $('#allmaster2').val(),
            alldeale: $('#alldealer').val(),
            allretailer: $('#allretailer').val(),
            allapiuser: $('#allapiuser').val() || '',
            Whitelabel: $('#allwhitelabel1').val() || '',
            ddl_Type: $('#ddl_Type').val() || ''
        }, function (data) {
            $('#successtotal').text('₹ ' + (data.totalsuccess || data.success || '0'));
            $('#Failedtotal').text('₹ ' + (data.totalfailed || data.failed || '0'));
            $('#Pendingtotal').text('₹ ' + (data.totalpending || data.pending || '0'));
            $panel.addClass('is-open').show().attr('aria-hidden', 'false');
            $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
        });
    };

    function init() {
        if (!$) {
            return;
        }
        enhanceLoader();
        initSelect2();
        if (window.answers) {
            answers();
        }
        if (window.vmMicroAtmRenumberSr) {
            window.vmMicroAtmRenumberSr();
        } else {
            renumberSrRows();
        }
    }

    window.vmMicroAtmRenumberSr = renumberSrRows;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
