/**
 * ADMIN — AEPS Charge Report page UI v=2
 */
(function (window, document, $) {
    'use strict';

    var PAGE_SELECTOR = '.saas-aeps-charge-report-page';

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
        }
    }

    function init() {
        if (!$) {
            return;
        }
        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmAepsChargeReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
