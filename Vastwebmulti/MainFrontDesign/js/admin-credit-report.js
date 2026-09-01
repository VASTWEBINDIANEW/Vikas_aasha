/**
 * ADMIN — Credit Report page UI v=2
 */
(function (window, document, $) {
    'use strict';

    var PAGE_SELECTOR = '.saas-credit-report-page';

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
        }
    }

    window.answers = function () {
        var selectedValue = $('#ddlusers').val();
        $('#allmaster,#dlm,#rem,#apiid').hide();
        if (selectedValue === 'master') {
            $('#allmaster').show();
        } else if (selectedValue === 'Dealer') {
            $('#dlm').show();
        } else if (selectedValue === 'Retailer') {
            $('#rem').show();
        } else if (selectedValue === 'API') {
            $('#apiid').show();
        }
    };

    function init() {
        if (!$) {
            return;
        }
        if (window.answers) {
            answers();
        }
        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmCreditReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
