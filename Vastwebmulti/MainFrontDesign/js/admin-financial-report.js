/**
 * ADMIN — Financial service reports (shared UI helpers)
 */
(function (window, document, $) {
    'use strict';

    function initFinNavActive() {
        var current = (window.location.pathname || '').toLowerCase();
        $('#fin-report-nav .vm-fin-nav__link, #fin-report-nav li a').each(function () {
            var $link = $(this);
            var href = ($link.attr('href') || '').toLowerCase();
            if (!href) {
                return;
            }
            if (current.indexOf(href.replace(/^~/, '')) !== -1 || href.indexOf(current) !== -1) {
                $link.addClass('is-active activee');
            }
        });
    }

    function bindTotalsToggle() {
        $(document).off('click.vmFinTotals', '.white-success-button, .vm-opr-totals-btn:not(.vm-dmt-totals-btn):not(.vm-mpos-totals-btn):not(.vm-aeps-totals-btn):not(.vm-pancard-totals-btn):not(.vm-pancard-new-totals-btn):not(.vm-pancard-manual-totals-btn):not(.vm-microatm-totals-btn):not(.vm-cashdeposit-totals-btn):not(.vm-ticket-totals-btn):not(.vm-cancel-totals-btn):not(.vm-bus-totals-btn):not(.vm-hotel-totals-btn):not(.vm-hotel-cancel-totals-btn):not(.vm-irctc-totals-btn):not(.vm-radiant-totals-btn):not(.vm-radiant-cms-totals-btn)').on('click.vmFinTotals', '.white-success-button, .vm-opr-totals-btn:not(.vm-dmt-totals-btn):not(.vm-mpos-totals-btn):not(.vm-aeps-totals-btn):not(.vm-pancard-totals-btn):not(.vm-pancard-new-totals-btn):not(.vm-pancard-manual-totals-btn):not(.vm-microatm-totals-btn):not(.vm-cashdeposit-totals-btn):not(.vm-ticket-totals-btn):not(.vm-cancel-totals-btn):not(.vm-bus-totals-btn):not(.vm-hotel-totals-btn):not(.vm-hotel-cancel-totals-btn):not(.vm-irctc-totals-btn):not(.vm-radiant-totals-btn):not(.vm-radiant-cms-totals-btn)', function () {
            var $panel = $(this).closest('.vm-opr-toolbar-unified, .saas-acc-toolbar, .d_menu, .page-header-third, .card-rel-third-respo').find('.vm-opr-totals-panel, .white-success, .white-successadmin-money').first();
            if ($panel.length) {
                $panel.toggleClass('is-open');
            }
        });
    }

    function init() {
        if (!$) {
            return;
        }
        initFinNavActive();
        bindTotalsToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
