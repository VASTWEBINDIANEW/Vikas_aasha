/**

 * ADMIN — R-Offer history report

 */

(function (window, document, $) {

    'use strict';



    function initSelect2() {
        if (!$ || !$.fn || !$.fn.select2) {
            return;
        }
        $('#allretailer, #OperatorName').each(function () {
            var $el = $(this);
            if (!$el.length) {
                return;
            }
            if ($el.data('select2')) {
                $el.select2('destroy');
            }
            $el.select2({
                width: '100%',
                dropdownParent: $('body'),
                allowClear: false,
                minimumResultsForSearch: 0,
                placeholder: $el.attr('title') || 'Select',
                language: {
                    noResults: function () { return 'No match found'; },
                    searching: function () { return 'Searching...'; },
                    inputTooShort: function () { return 'Type to search...'; }
                }
            });
        });
    }

    function bindSelectSearchFocus() {
        $(document).off('select2:open.vmRofferSelectSearch').on('select2:open.vmRofferSelectSearch', '.saas-roffer-report-page select.vm-opr-select', function () {
            window.setTimeout(function () {
                var $search = $('.select2-container--open .select2-search__field');
                if ($search.length) {
                    $search.attr('placeholder', 'Search...');
                    $search.trigger('focus');
                }
            }, 0);
        });
    }



    function initDates() {

        if (typeof window.initAdminReportDateForm === 'function') {

            window.initAdminReportDateForm('#rofferReportForm');

        }

    }



    function dedupeEmptyRows() {

        var $emptyRows = $('#trow .vm-opr-table-empty-row');

        if ($emptyRows.length > 1) {

            $emptyRows.slice(1).remove();

        }

    }



    function initInfiniteScroll() {

        if (!$) {

            return;

        }

        var pageindex = 2;

        var noMoreData = $('#trow .vm-opr-table-empty-row').length > 0;

        var inProgress = false;

        var form = document.getElementById('rofferReportForm');

        var scrollUrl = form ? (form.getAttribute('data-scroll-url') || '') : '';

        if (!scrollUrl) {

            return;

        }



        $(window).off('scroll.vmRoffer').on('scroll.vmRoffer', function () {

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

                    allretailer: $('#allretailer').val(),

                    OperatorName: $('#OperatorName').val(),

                    txt_frm_date: $('#txt_frm_date').val(),

                    txt_to_date: $('#txt_to_date').val(),

                    PageIndex: pageindex

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



    function bindCommEdit() {

        if (!$) {

            return;

        }

        $(document).off('click.vmRofferComm', '.butt').on('click.vmRofferComm', '.butt', function () {

            $(this).closest('tr').hide().next('tr').show();

        });

    }



    function bindExports() {

        if (!$) {

            return;

        }

        $('#btnExl').off('click.vmRoffer').on('click.vmRoffer', function () {

            var base = window.vmRofferUrls && window.vmRofferUrls.excel;

            if (!base) {

                return;

            }

            var qs = $.param({

                allretailer: $('#allretailer').val(),

                txt_frm_date: $('#txt_frm_date').val(),

                txt_to_date: $('#txt_to_date').val(),

                OperatorName: $('#OperatorName').val()

            });

            window.location.href = base + '?' + qs;

        });



        $('#btnPDF').off('click.vmRoffer').on('click.vmRoffer', function () {

            var base = window.vmRofferUrls && window.vmRofferUrls.pdf;

            if (!base) {

                return;

            }

            var qs = $.param({

                allretailer: $('#allretailer').val(),

                txt_frm_date: $('#txt_frm_date').val(),

                txt_to_date: $('#txt_to_date').val(),

                OperatorName: $('#OperatorName').val()

            });

            window.open(base + '?' + qs, '_blank');

        });

    }



    function bindSharingToggle() {

        if (!$) {

            return;

        }

        $('#rofferSharingToggle').off('click.vmRoffer').on('click.vmRoffer', function () {

            var url = window.vmRofferUrls && window.vmRofferUrls.offersts;

            if (!url) {

                return;

            }

            var $btn = $(this);

            $.get(url).done(function () {

                $btn.toggleClass('is-on is-off');

                var on = $btn.hasClass('is-on');

                $btn.find('i').attr('class', on ? 'fas fa-check-circle' : 'fas fa-times-circle');

            });

        });

    }



    window.vmRofferSaveComm = function (id) {

        if (!$) {

            return;

        }

        var url = window.vmRofferUrls && window.vmRofferUrls.updateComm;

        if (!url) {

            return;

        }

        $.ajax({

            url: url,

            data: { Idno: id, baseval: $('#' + id).val() },

            type: 'GET',

            cache: false

        }).done(function (data) {

            $('#tblList').html(data);

            bindCommEdit();

        });

    };



    function init() {

        dedupeEmptyRows();
        initSelect2();
        bindSelectSearchFocus();
        initDates();

        initInfiniteScroll();

        bindCommEdit();

        bindExports();

        bindSharingToggle();

    }



    window.vmRofferInit = init;



    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})(window, document, window.jQuery);

