/**

 * ADMIN — Credit Report page UI v=1

 */

(function (window, document, $) {

    'use strict';



    function initSelect2() {

        if (!$ || !$.fn.select2) {

            return;

        }

        var $targets = $('.saas-credit-report-page #allmaster1, .saas-credit-report-page #alldealer, .saas-credit-report-page #allretailer, .saas-credit-report-page #allapiuser');

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

        initSelect2();

        if (window.answers) {

            answers();

        }

    }



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

