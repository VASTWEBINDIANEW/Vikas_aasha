/**

 * ADMIN — Money_Transfer_Report page UI v=10

 */

(function (window, document, $) {

    'use strict';



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

        initSelect2();

        bindTableRefresh();

        bindResendActions();

    }



    window.vmDmtRenumberSr = renumberSrRows;



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

