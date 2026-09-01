/**

 * ADMIN — Pan Card NEW report page UI v=1

 */

(function (window, document, $) {

    'use strict';



    var PAGE_SELECTOR = '.saas-pancard-new-page';

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
        }
    }



    function initDatepicker() {

        if (!$ || !$.fn.datepicker) {

            return;

        }

        $('.saas-pancard-new-page .saas-acc-dp-field').datepicker({

            format: 'yyyy-mm-dd',

            todayHighlight: true,

            autoclose: true,

            orientation: 'bottom auto'

        });

    }



    window.hidePancardNewTotals = function () {

        var $panel = $('#pancardNewTotalsPanel');

        var $btn = $('.vm-pancard-new-totals-btn');

        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');

        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });

    };



    window.findtotalPancardNew = function () {

        if (!$) {

            return;

        }

        var $panel = $('#pancardNewTotalsPanel');

        var $btn = $('.vm-pancard-new-totals-btn');



        if ($panel.hasClass('is-open')) {

            hidePancardNewTotals();

            return;

        }



        $.post(window.pancardNewTotalsUrl || '', {

            ddlusers: 'Retailer',

            allmaster: '',

            alldealer: '',

            allretailer: $('#allretailer').val(),

            allapiuser: '',

            Whitelabel: '',

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



    window.openPopup = function (el) {

        var $btn = $(el);

        $('#popup_name').val($btn.data('name') || '');

        $('#popup_email').val($btn.data('email') || '');

        $('#popup_amount').val($btn.data('amount') || '');

        $('#popup_comm').val($btn.data('comm') || '');

        $('#idno').val($btn.data('idno') || '');

        $('#status').val($btn.data('status') || '');

        $('#requestid').val($btn.data('requestid') || '');

        $('#sts').val($btn.data('sts') || '');



        var sts = String($btn.data('sts') || '');

        var isSuccess = sts.toLowerCase() === 'success';

        var $submit = $('#submitButton');

        $submit.val(isSuccess ? 'Success' : 'Failed');

        $submit.text(isSuccess ? 'Mark Success' : 'Mark Failed');

        $submit.removeClass('saas-admin-modal-btn--primary saas-admin-modal-btn--danger')

            .addClass(isSuccess ? 'saas-admin-modal-btn--primary' : 'saas-admin-modal-btn--danger');



        $('#pancardPendingModal').modal('show');

    };



    window.hidebox = function () {

        if (window.hidePancardPendingModal) {

            hidePancardPendingModal();

        }

    };



    function init() {
        initDatepicker();
        if (window.vmPancardRenumberSr) {
            window.vmPancardRenumberSr();
        }
        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmPancardNewReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });
    }



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

