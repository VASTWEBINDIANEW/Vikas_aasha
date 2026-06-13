/**
 * ADMIN — Flight / Bus / Hotel / IRCTC Ticket Report page UI v=12
 */
(function (window, document, $) {
    'use strict';

    var pageIndex = 2;
    var noMoreData = false;
    var inProgress = false;

    var extraWrapSelectors = [
        '#ticket-wrap-whitelabel',
        '#ticket-wrap-master',
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

    function initTicketTravelNav() {
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

    function getScrollFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            PNR: $('#PNR').val() || '',
            ddl_status: $('#ddl_status').val() || '',
            ddlusers: $('#ddlusers').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || '',
            allwhitelabel: $('select#allwhitelabel').val() || ''
        };
    }

    function bindInfiniteScroll() {
        if (!$) {
            return;
        }

        $(window).off('scroll.vmTicketReport').on('scroll.vmTicketReport', function () {
            var $table = $('#flightticket');
            if (!$table.length || noMoreData || inProgress) {
                return;
            }
            if ($(window).scrollTop() <= Number($table.height()) / 4) {
                return;
            }

            inProgress = true;
            $('#loadingdiv').show();
            var payload = getScrollFilters();
            payload.pageindex = pageIndex;

            $.post(window.ticketReportScrollUrl || '', payload, function (data) {
                pageIndex += 1;
                noMoreData = !!data.NoMoredata;
                if (data.HTMLString) {
                    $('#trow').append(data.HTMLString);
                }
            }).always(function () {
                $('#loadingdiv').hide();
                inProgress = false;
            });
        });
    }

    function bindUserFilterChange() {
        if (!$) {
            return;
        }

        $('#ddlusers')
            .off('change.vmTicketReport select2:select.vmTicketReport')
            .on('change.vmTicketReport select2:select.vmTicketReport', function () {
                window.answers();
            });
    }

    window.answers = function () {
        var answer = $('#ddlusers').val() || 'Admin';

        hideAllUserExtras();

        if (answer === 'Dealer') {
            showUserExtra('#dlm');
        } else if (answer === 'Whitelabel') {
            showUserExtra('#ticket-wrap-whitelabel');
        } else if (answer === 'Master') {
            showUserExtra('#ticket-wrap-master');
        } else if (answer === 'Retailer') {
            showUserExtra('#rem');
        }

        initFilterSelect2();
    };

    window.hideTicketTotals = function () {
        var $panel = $('#ticketTotalsPanel');
        var $btn = $('.vm-ticket-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    function getBusReportFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            TicketNo: $('#TicketNo').val() || '',
            ddl_status: $('#ddl_status').val() || '',
            ddlusers: $('#ddlusers').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || '',
            allwhitelabel: $('select#allwhitelabel').val() || ''
        };
    }

    function applyTotalsToPanel($panel, $btn, data) {
        $('#successtotal').text('₹ ' + (data.success || '0'));
        $('#Failedtotal').text('₹ ' + (data.failed || '0'));
        $('#Pendingtotal').text('₹ ' + (data.pending || '0'));
        $panel.addClass('is-open').show().attr('aria-hidden', 'false');
        $btn.addClass('is-active').attr({ title: 'Hide totals', 'aria-expanded': 'true' });
    }

    window.findtotalTicket = function () {
        if (!$) {
            return;
        }

        var $panel = $('#ticketTotalsPanel');
        var $btn = $('.vm-ticket-totals-btn');
        if ($panel.hasClass('is-open')) {
            hideTicketTotals();
            return;
        }

        $.post(window.ticketReportTotalsUrl || '', getScrollFilters(), function (data) {
            applyTotalsToPanel($panel, $btn, data);
        });
    };

    window.hideBusTotals = function () {
        var $panel = $('#busTotalsPanel');
        var $btn = $('.vm-bus-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    function getHotelReportFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            ddl_status: $('#ddl_status').val() || '',
            ddl_status_ticket: $('#ddl_status_ticket').val() || '',
            ddlusers: $('#ddlusers').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || '',
            allwhitelabel: $('select#allwhitelabel').val() || ''
        };
    }

    window.findtotalBus = function () {
        if (!$) {
            return;
        }

        var $panel = $('#busTotalsPanel');
        var $btn = $('.vm-bus-totals-btn');
        if ($panel.hasClass('is-open')) {
            hideBusTotals();
            return;
        }

        var totalsUrl = (window.busReportBaseUrl || window.busReportTotalsUrl || '') + '?export=total&' + $.param(getBusReportFilters());
        $.get(totalsUrl, function (data) {
            applyTotalsToPanel($panel, $btn, data);
        }).fail(function () {
            if (typeof swal === 'function') {
                swal('Oops!', 'Unable to load bus booking totals.', 'error');
            }
        });
    };

    window.hideHotelTotals = function () {
        var $panel = $('#hotelTotalsPanel');
        var $btn = $('.vm-hotel-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    window.findtotalHotel = function () {
        if (!$) {
            return;
        }

        var $panel = $('#hotelTotalsPanel');
        var $btn = $('.vm-hotel-totals-btn');
        if ($panel.hasClass('is-open')) {
            hideHotelTotals();
            return;
        }

        var totalsUrl = (window.hotelReportBaseUrl || '') + '?export=total&' + $.param(getHotelReportFilters());
        $.get(totalsUrl, function (data) {
            applyTotalsToPanel($panel, $btn, data);
        }).fail(function () {
            if (typeof swal === 'function') {
                swal('Oops!', 'Unable to load hotel booking totals.', 'error');
            }
        });
    };

    window.resetTicketScroll = function () {
        pageIndex = 2;
        noMoreData = false;
        inProgress = false;
    };

    function getIrctcReportFilters() {
        return {
            txt_frm_date: $('#txt_frm_date').val(),
            txt_to_date: $('#txt_to_date').val(),
            ddl_status: $('#ddl_status').val() || '',
            allmaster: $('select#allmaster').val() || '',
            alldealer: $('#alldealer').val() || '',
            allretailer: $('#allretailer').val() || ''
        };
    }

    function initIrctcFilterSelect2() {
        if (!$ || !$.fn.select2) {
            return;
        }

        applySelect2($('#allmaster'));
        applySelect2($('#alldealer'));
        applySelect2($('#allretailer'));
        applySelect2($('#ddl_status'));
    }

    window.hideIrctcTotals = function () {
        var $panel = $('#irctcTotalsPanel');
        var $btn = $('.vm-irctc-totals-btn');
        $panel.removeClass('is-open').hide().attr('aria-hidden', 'true');
        $btn.removeClass('is-active').attr({ title: 'Show totals', 'aria-expanded': 'false' });
    };

    window.findtotalIrctc = function () {
        if (!$) {
            return;
        }

        var $panel = $('#irctcTotalsPanel');
        var $btn = $('.vm-irctc-totals-btn');
        if ($panel.hasClass('is-open')) {
            hideIrctcTotals();
            return;
        }

        var totalsUrl = (window.irctcReportBaseUrl || '') + '?export=total&' + $.param(getIrctcReportFilters());
        $.get(totalsUrl, function (data) {
            applyTotalsToPanel($panel, $btn, data);
        }).fail(function () {
            if (typeof swal === 'function') {
                swal('Oops!', 'Unable to load IRCTC totals.', 'error');
            }
        });
    };

    function init() {
        if (!$) {
            return;
        }

        initTicketTravelNav();

        if ($('.saas-irctc-report-page').length) {
            initIrctcFilterSelect2();
        } else {
            bindUserFilterChange();
            window.answers();
            bindInfiniteScroll();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
