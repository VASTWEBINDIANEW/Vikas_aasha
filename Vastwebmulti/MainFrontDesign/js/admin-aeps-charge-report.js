/**
 * ADMIN — AEPS Charge Report page UI v=1
 */
(function (window, document, $) {
    'use strict';

    function initSelect2() {
        if (!$ || !$.fn.select2) {
            return;
        }
        var $targets = $('.saas-aeps-charge-report-page #allretailer, .saas-aeps-charge-report-page #Type');
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

    function init() {
        if (!$) {
            return;
        }
        initSelect2();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
