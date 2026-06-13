/**
 * ADMIN — Flight & Hotel Cancellation Report page UI v=4
 */
(function (window, document, $) {
    'use strict';

    var extraWrapSelectors = [
        '#cancel-wrap-whitelabel',
        '#cancel-wrap-master',
        '#dlm',
        '#rem'
    ];

    var extraSelectSelectors = [
        'select#allwhitelabel',
        'select#allmaster',
        '#alldealer',
        '#allretailer'
    ];

    function destroySelect2($el) {
        if ($el && $el.length && $el.data('select2')) {
            $el.select2('destroy');
        }
    }

    function applySelect2($el) {
        if (!$el || !$el.length || !$.fn.select2) {
            return;
        }

        destroySelect2($el);

        $el.select2({
            width: '100%',
            dropdownAutoWidth: false,
            minimumResultsForSearch: 6,
            dropdownParent: $el.closest('.vm-rpt-filters-panel')
        });
    }

    function initFilterSelect2() {
        if (!$ || !$.fn.select2) {
            return;
        }

        applySelect2($('#ddlusers'));
        applySelect2($('#ddl_status'));

        $(extraSelectSelectors.join(', ')).each(function () {
            var $el = $(this);
            var $wrap = $el.closest('.vm-opr-filter-extra');

            if ($wrap.length && !$wrap.hasClass('is-visible')) {
                destroySelect2($el);
                return;
            }

            applySelect2($el);
        });
    }

    function hideAllUserExtras() {
        $(extraWrapSelectors.join(', ')).each(function () {
            $(this).removeClass('is-visible').attr('hidden', 'hidden').css('display', 'none');
        });
        $(extraSelectSelectors.join(', ')).each(function () {
            destroySelect2($(this));
        });
    }

    function showUserExtra(selector) {
        $(selector).addClass('is-visible').removeAttr('hidden').css('display', '');
    }

    function initTravelNav() {
        var current = (window.location.pathname || '').toLowerCase();
        $('#ticket-travel-nav .vm-fin-nav__link, #ticket-flight-nav .vm-fin-nav__link').each(function () {
            var $link = $(this);
            var href = ($link.attr('href') || '').toLowerCase().replace(/^~/, '');
            if (!href) {
                return;
            }
            if (current.indexOf(href) !== -1 || href.indexOf(current) !== -1) {
                $link.addClass('is-active');
            }
        });
    }

    function getCancellationFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            PNR: $('#PNR').val() || '',
            ddl_status: $('#ddl_status').val() || 'ALL',
            ddlusers: $('#ddlusers').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || '',
            allwhitelabel: $('select#allwhitelabel').val() || ''
        };
    }

    function bindUserFilterChange() {
        if (!$) {
            return;
        }

        $('#ddlusers')
            .off('change.vmCancelReport select2:select.vmCancelReport')
            .on('change.vmCancelReport select2:select.vmCancelReport', function () {
                window.answers();
            });
    }

    window.answers = function () {
        var answer = $('#ddlusers').val() || 'Admin';

        hideAllUserExtras();

        if (answer === 'Dealer') {
            showUserExtra('#dlm');
        } else if (answer === 'Whitelabel') {
            showUserExtra('#cancel-wrap-whitelabel');
        } else if (answer === 'Master') {
            showUserExtra('#cancel-wrap-master');
        } else if (answer === 'Retailer') {
            showUserExtra('#rem');
        }

        initFilterSelect2();
    };

    window.hideCancellationTotals = function () {
        var $panel = $('#cancellationTotalsPanel');
        var $btn = $('.vm-cancel-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    window.findtotalCancellation = function () {
        if (!$) {
            return;
        }

        var $panel = $('#cancellationTotalsPanel');
        var $btn = $('.vm-cancel-totals-btn');

        if ($panel.hasClass('is-open')) {
            hideCancellationTotals();
            return;
        }

        var totalsUrl = (window.cancellationReportBaseUrl || '') + '?export=total&' + $.param(getCancellationFilters());
        $.get(totalsUrl, function (data) {
            $('#successtotal').text('₹ ' + (data.success || '0'));
            $('#Failedtotal').text('₹ ' + (data.failed || '0'));
            $('#Pendingtotal').text('₹ ' + (data.pending || '0'));
            $panel.addClass('is-open').show().attr('aria-hidden', 'false');
            $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
        });
    };

    function getHotelCancellationFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            BookingId: $('#BookingId').val() || '',
            ddl_status: $('#ddl_status').val() || '',
            ddlusers: $('#ddlusers').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || '',
            allwhitelabel: $('select#allwhitelabel').val() || ''
        };
    }

    window.hideHotelCancellationTotals = function () {
        var $panel = $('#hotelCancellationTotalsPanel');
        var $btn = $('.vm-hotel-cancel-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    window.findtotalHotelCancellation = function () {
        if (!$) {
            return;
        }

        var $panel = $('#hotelCancellationTotalsPanel');
        var $btn = $('.vm-hotel-cancel-totals-btn');

        if ($panel.hasClass('is-open')) {
            hideHotelCancellationTotals();
            return;
        }

        var totalsUrl = (window.hotelCancellationQueueBaseUrl || '') + '?export=total&' + $.param(getHotelCancellationFilters());
        $.get(totalsUrl, function (data) {
            $('#successtotal').text('₹ ' + (data.success || '0'));
            $('#Failedtotal').text('₹ ' + (data.failed || '0'));
            $('#Pendingtotal').text('₹ ' + (data.pending || '0'));
            $panel.addClass('is-open').show().attr('aria-hidden', 'false');
            $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
        });
    };

    function init() {
        if (!$) {
            return;
        }

        initTravelNav();
        bindUserFilterChange();
        window.answers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
