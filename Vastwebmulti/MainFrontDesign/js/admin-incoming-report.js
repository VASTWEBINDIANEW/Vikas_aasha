/**
 * ADMIN — Incoming messages report
 */
(function (window, document, $) {
    'use strict';

    function initSelect2() {
        if (!$ || !$.fn || !$.fn.select2) {
            return;
        }
        var $port = $('#lapuno11');
        if (!$port.length || $port.data('select2')) {
            return;
        }
        $port.select2({
            width: '100%',
            dropdownParent: $('body'),
            allowClear: false,
            minimumResultsForSearch: 8,
            placeholder: $port.attr('title') || 'Port No'
        });
    }

    function initDates() {
        if (typeof window.initAdminReportDateForm === 'function') {
            window.initAdminReportDateForm('#incomingReportForm');
        }
    }

    function initInfiniteScroll() {
        if (!$) {
            return;
        }
        var pageindex = 2;
        var noMoreData = $('#trow .vm-opr-table-empty-row').length > 0;
        var inProgress = false;
        var form = document.getElementById('incomingReportForm');
        var scrollUrl = form ? (form.getAttribute('data-scroll-url') || '') : '';
        if (!scrollUrl) {
            return;
        }

        $(window).off('scroll.vmIncoming').on('scroll.vmIncoming', function () {
            var $table = $('#example');
            if (!$table.length || noMoreData || inProgress) {
                return;
            }
            if ($(window).scrollTop() <= Number($table.height()) / 4) {
                return;
            }

            inProgress = true;
            $('#loadingdiv').show();

            $.ajax({
                url: scrollUrl,
                type: 'POST',
                dataType: 'json',
                data: {
                    lapuno11: $('#lapuno11').val(),
                    txtmsg: $('#txtmsg').val(),
                    txt_frm_date: $('#txt_frm_date').val(),
                    txt_to_date: $('#txt_to_date').val(),
                    pageIndex: pageindex
                }
            }).done(function (data) {
                pageindex += 1;
                if (data && data.NoMoredata) {
                    noMoreData = data.NoMoredata;
                }
                if (data && data.HTMLString) {
                    var html = String(data.HTMLString);
                    if (html.indexOf('vm-opr-table-empty-row') === -1) {
                        $('#trow .vm-opr-table-empty-row').remove();
                        $('#trow').append(html);
                    }
                }
                $('#loadingdiv').hide();
                inProgress = false;
            }).fail(function () {
                $('#loadingdiv').hide();
                inProgress = false;
            });
        });
    }

    function dedupeEmptyRows() {
        var $emptyRows = $('#trow .vm-opr-table-empty-row');
        if ($emptyRows.length > 1) {
            $emptyRows.slice(1).remove();
        }
    }

    function init() {
        dedupeEmptyRows();
        initSelect2();
        initDates();
        initInfiniteScroll();
    }

    window.vmIncInit = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
