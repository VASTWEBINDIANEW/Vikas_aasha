/**
 * ADMIN — Pan Card OLD (TokenPurchaseReport) page UI v=1
 */
(function (window, document, $) {
    'use strict';

    function initDatepicker() {
        if (!$ || !$.fn.datepicker) {
            return;
        }
        $('.saas-pancard-old-page .saas-acc-dp-field').datepicker({
            format: 'yyyy-mm-dd',
            todayHighlight: true,
            autoclose: true,
            orientation: 'bottom auto'
        });
    }

    window.answers1 = function () {
        var answer = $('#ddlusers').val();
        $('#allmaster,#dlm,#rem,#apiid,#whitelabelid').hide();
        if (answer === 'Dealer') { $('#dlm').show(); }
        else if (answer === 'Master') { $('#allmaster').show(); }
        else if (answer === 'Retailer') { $('#rem').show(); }
        else if (answer === 'APIID') { $('#apiid').show(); }
        else if (answer === 'WAdmin') { $('#whitelabelid').show(); }
    };

    window.findtotal = function () {
        if (!$) {
            return;
        }
        var $panel = $('#pancardTotalsPanel');
        var $btn = $('.vm-pancard-totals-btn');

        if ($panel.hasClass('is-open')) {
            hidePancardTotals();
            return;
        }

        $.post(window.pancardOldTotalsUrl || '', {
            ddlusers: $('#ddlusers').val(),
            allmaster: $('#allmaster1').val(),
            alldealer: $('#alldealer').val(),
            allretailer: $('#allretailer').val(),
            allapiuser: $('#allapiuser').val(),
            Whitelabel: $('#Whitelabel').val(),
            ddl_status: $('#ddl_status').val(),
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val()
        }, function (data) {
            $('#successtotal').text('₹ ' + data.success);
            $('#Failedtotal').text('₹ ' + data.failed);
            $('#Pendingtotal').text('₹ ' + data.pending);
            $panel.addClass('is-open').show().attr('aria-hidden', 'false');
            $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
        });
    };

    function init() {
        initDatepicker();
        if (window.answers1) {
            answers1();
        }
        if (window.vmPancardRenumberSr) {
            window.vmPancardRenumberSr();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
