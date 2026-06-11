/**

 * ADMIN — Money_Transfer_Report page UI v=7

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

        var $targets = $('.saas-dmt-report-page .allmasters, .saas-dmt-report-page #alldealer, .saas-dmt-report-page #allretailer, .saas-dmt-report-page #allapiuser');

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



    function init() {

        if (!$) {

            return;

        }

        enhanceLoader();

        initSelect2();

        bindTableRefresh();

    }



    window.vmDmtRenumberSr = renumberSrRows;



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

