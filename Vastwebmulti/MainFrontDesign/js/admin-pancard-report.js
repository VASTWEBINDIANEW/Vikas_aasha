/**

 * ADMIN — Pan Card Report pages UI v=1

 */

(function (window, document, $) {

    'use strict';



    function enhanceLoader() {

        var $loader = $('#loadingdiv');

        if ($loader.length && !$loader.find('.vm-dmt-loading-text').length) {

            $loader.addClass('vm-opr-table-loading').append('<div class="vm-dmt-loading-text">Loading transactions…</div>');

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



    var PAGE_SELECTOR = '.saas-pancard-report-page';

    function refreshReportSelects() {
        if (typeof window.initReportPageSelects === 'function') {
            window.initReportPageSelects($(PAGE_SELECTOR));
        }
    }



    function bindTableRefresh() {

        if (!$) {

            return;

        }

        renumberSrRows();

        $(document).ajaxComplete(function (_evt, _xhr, settings) {

            var url = (settings && settings.url) ? String(settings.url) : '';

            if (url.indexOf('InfiniteScroll3') !== -1) {

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

        window.setTimeout(refreshReportSelects, 400);
        $(window).on('load.vmPancardReport', function () {
            window.setTimeout(refreshReportSelects, 200);
        });

    }



    window.vmPancardRenumberSr = renumberSrRows;



    window.hidePancardTotals = function () {

        var $panel = $('#pancardTotalsPanel');

        var $btn = $('.vm-pancard-totals-btn');

        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');

        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });

    };



    window.hidePancardPendingModal = function () {

        $('#pancardPendingModal').modal('hide');

    };



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

