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

    window.hideMicroAtmTotals = function () {
        $('.vm-microatm-totals-panel').removeClass('is-open');
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
