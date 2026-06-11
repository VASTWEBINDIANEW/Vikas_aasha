/**
 * ADMIN — Operator_report_new page helpers
 */
(function (window, document, $) {
    'use strict';

    var TABLE_ID = 'example';
    var BULK_MODAL_IDS = ['s-b-pop', 'f-b-pop', 'r-b-pop', 'defaultModal1', 'defaultModal222'];
    var SELECT_SELECTOR = '.saas-operator-report-page select.vm-opr-select';
    var EMPTY_ROW_HTML = '<tr class="vm-opr-table-empty-row"><td colspan="16" class="vm-opr-table-empty"><i class="fas fa-inbox" aria-hidden="true"></i><span>No transactions for selected filters. Adjust dates or search to load data.</span></td></tr>';

    function resetStuckModals() {
        var i;
        var el;
        for (i = 0; i < BULK_MODAL_IDS.length; i++) {
            el = document.getElementById(BULK_MODAL_IDS[i]);
            if (!el) {
                continue;
            }
            el.classList.remove('in');
            el.setAttribute('aria-hidden', 'true');
            if (!el.classList.contains('vm-app-overlay-open')) {
                el.style.display = 'none';
            }
        }
        document.body.classList.remove('modal-open');
        var backdrops = document.querySelectorAll('.modal-backdrop');
        for (i = 0; i < backdrops.length; i++) {
            if (backdrops[i].parentNode) {
                backdrops[i].parentNode.removeChild(backdrops[i]);
            }
        }
    }

    function bindModalCleanup() {
        if (!$ || !$.fn || !$.fn.modal) {
            return;
        }
        $(document).on('hidden.bs.modal', '.saas-operator-report-page .modal', function () {
            resetStuckModals();
        });
        $(document).on('click', '.saas-operator-report-page .saas-admin-modal-close, .saas-operator-report-page [data-dismiss="modal"]', function () {
            var modal = $(this).closest('.modal');
            if (modal.length) {
                modal.modal('hide');
            }
        });
    }

    function enhanceMobileTable() {
        /* Mobile uses same table as desktop with horizontal scroll — no card layout */
        var table = document.getElementById(TABLE_ID);
        if (table) {
            table.classList.remove('vm-opr-mobile-ready');
        }
    }

    function patchBulkActionBar() {
        /* Bulk toolbar removed from page — no toggle with consumer lookup */
    }

    function safeConverttoDate(str) {
        if (!str) {
            return '';
        }
        var date = new Date(str);
        if (isNaN(date.getTime())) {
            return '';
        }
        var mnth = ('0' + (date.getMonth() + 1)).slice(-2);
        var day = ('0' + date.getDate()).slice(-2);
        var hrs = date.getHours();
        var mnts = date.getMinutes();
        var sec = date.getSeconds();
        return [day, mnth, date.getFullYear()].join('-') + ' ' + [hrs + ':' + mnts + ':' + sec];
    }

    function patchConverttoDate() {
        if (typeof window.converttoDate === 'function' && !window.converttoDate.__vmOprPatched) {
            var orig = window.converttoDate;
            window.converttoDate = function (str) {
                try {
                    var result = orig(str);
                    if (result && !isNaN(new Date(str).getTime())) {
                        return result;
                    }
                } catch (e) { /* fall through */ }
                return safeConverttoDate(str);
            };
            window.converttoDate.__vmOprPatched = true;
        } else if (typeof window.converttoDate !== 'function') {
            window.converttoDate = safeConverttoDate;
        }
    }

    function getSelect2Opts($el) {
        var id = $el.attr('id') || '';
        var isSearchable = id === 'Operator' || id === 'ddlusers' || id === 'txtcode';
        var isMultiple = $el.prop('multiple');
        return {
            width: '100%',
            dropdownParent: $('body'),
            allowClear: false,
            closeOnSelect: !isMultiple,
            minimumResultsForSearch: isSearchable ? 0 : 8,
            placeholder: $el.attr('title') || $el.find('option:first').text() || 'Select'
        };
    }

    function destroySelect2($el) {
        if ($el && $el.length && $el.data('select2')) {
            $el.select2('destroy');
        }
    }

    function isSelectVisible($el) {
        var $wrap = $el.closest('.vm-opr-field, .vm-opr-filter-extra');
        if ($wrap.length && ($wrap.is(':hidden') || $wrap.css('display') === 'none')) {
            return false;
        }
        return $el.is(':visible') || $el.closest('.vm-opr-field--operator, .vm-opr-field--code').is(':visible');
    }

    function initOprSelects() {
        if (!$ || !$.fn || !$.fn.select2) {
            return;
        }
        $(SELECT_SELECTOR).each(function () {
            var $el = $(this);
            if (!isSelectVisible($el)) {
                destroySelect2($el);
                return;
            }
            if ($el.data('select2')) {
                return;
            }
            $el.select2(getSelect2Opts($el));
        });
    }

    function refreshSelect2($el) {
        if (!$el || !$el.length) {
            return;
        }
        var val = $el.val();
        destroySelect2($el);
        if (isSelectVisible($el)) {
            $el.select2(getSelect2Opts($el));
            if (val !== null && val !== undefined) {
                $el.val(val).trigger('change.select2');
            }
        }
    }

    function setSelectIndex(id, index) {
        var el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.selectedIndex = index;
        refreshSelect2($(el));
    }

    function restoreFilterState() {
        var form = document.getElementById('operatorReportForm');
        if (!form) {
            return;
        }
        var usertype = form.getAttribute('data_ddlusers') || '';
        var userid = form.getAttribute('data_user') || '';
        if (!usertype) {
            return;
        }
        $('#ddlusers').val(usertype);
        if (typeof window.answers === 'function') {
            window.answers();
        }
        if (usertype === 'Master') {
            $('#allmaster1').val(userid);
        } else if (usertype === 'Dealer') {
            $('#alldealer').val(userid);
        } else if (usertype === 'Retailer') {
            $('#allretailer').val(userid);
        } else if (usertype === 'API') {
            $('#API').val(userid);
        } else if (usertype === 'WAdmin') {
            $('#Whitelabel').val(userid);
        }
        initOprSelects();
        $(SELECT_SELECTOR).trigger('change.select2');
    }

    function bindUserTypeChange() {
        $('#ddlusers').off('change.vmOprUser').on('change.vmOprUser', function () {
            if (typeof window.answers === 'function') {
                window.answers();
            }
        });
    }

    function portUsesCodeList(port) {
        var chk = port || '';
        return chk.indexOf('COM') !== -1 ||
            chk.indexOf('APP') !== -1 ||
            chk.indexOf('RCH') !== -1 ||
            chk === 'DISH' ||
            chk === 'TSSKY' ||
            chk === 'VID';
    }

    function showCodeMode() {
        $('.vm-opr-field--code').show();
        $('.vm-opr-field--operator').hide();
        setSelectIndex('Operator', 0);
        initOprSelects();
    }

    function showOperatorMode() {
        $('.vm-opr-field--code').hide();
        $('.vm-opr-field--operator').show();
        destroySelect2($('#txtcode'));
        initOprSelects();
    }

    function updateTxtcodeOptions(html) {
        var $tc = $('#txtcode');
        if (!$tc.length) {
            return;
        }
        $tc.html(html);
        refreshSelect2($tc);
    }

    function afterAnswers() {
        var resetIds = ['allretailer', 'allmaster1', 'alldealer', 'API', 'Whitelabel'];
        var i;
        $('.vm-opr-filter-extra').each(function () {
            var $wrap = $(this);
            var visible = this.style.display !== 'none';
            $wrap.toggleClass('is-visible', visible);
            if (visible) {
                refreshSelect2($wrap.find('select.vm-opr-select'));
            } else {
                destroySelect2($wrap.find('select.vm-opr-select'));
            }
        });
        for (i = 0; i < resetIds.length; i++) {
            var el = document.getElementById(resetIds[i]);
            if (el && el.selectedIndex === 0) {
                refreshSelect2($(el));
            }
        }
        refreshSelect2($('#ddlusers'));
        initOprSelects();
    }

    function applyInitialPortMode() {
        var port = $('#lapuno11').val();
        if (port && portUsesCodeList(port)) {
            showCodeMode();
        } else {
            showOperatorMode();
        }
    }

    function initSelects() {
        if (!$ || !$.fn || !$.fn.select2) {
            return;
        }
        bindUserTypeChange();
        initOprSelects();
        restoreFilterState();
        applyInitialPortMode();
    }

    function enhanceTotalsPanel() {
        /* findtotal() in view handles show/hide toggle via is-open class */
    }

    function normalizePortChips() {
        var rail = document.getElementById('all');
        if (!rail) {
            return;
        }
        if (!rail.querySelector('.vm-opr-port-chip')) {
            rail.classList.add('is-empty');
        } else {
            rail.classList.remove('is-empty');
        }
    }

    function bindPortChipActive() {
        $(document).off('click.vmOprPortChip', '.vm-opr-port-chip').on('click.vmOprPortChip', '.vm-opr-port-chip', function () {
            $('.vm-opr-port-chip').removeClass('is-active');
            $(this).addClass('is-active');
        });
    }

    var FILTER_FIELD_NAMES = [
        'ddlusers', 'allmaster1', 'alldealer', 'allretailer', 'API', 'Whitelabel',
        'ddl_status', 'lapuno11', 'Operator', 'txt_frm_date', 'txt_to_date', 'txtdemo'
    ];

    function readFormField($form, name) {
        var $el = $form.find('[name="' + name + '"]');
        if (!$el.length) {
            return '';
        }
        var val = $el.val();
        if (val === null || val === undefined) {
            return '';
        }
        if ($.isArray(val)) {
            return val.join(',');
        }
        return String(val);
    }

    function collectFilterPayload($sourceForm) {
        var $filterForm = $('#operatorReportForm');
        var data = {};
        var i;

        if ($filterForm.length) {
            for (i = 0; i < FILTER_FIELD_NAMES.length; i++) {
                data[FILTER_FIELD_NAMES[i]] = readFormField($filterForm, FILTER_FIELD_NAMES[i]);
            }
        }

        if ($sourceForm && $sourceForm.length && $sourceForm.is('.vm-opr-consumer-search-form')) {
            data.txtmob = $.trim($sourceForm.find('[name="txtmob"]').val() || '');
        } else {
            data.txtmob = '';
            $('#txtmob').val('');
        }

        return data;
    }

    function normalizeSearchHtml(html) {
        var text = html ? String(html).trim() : '';
        if (!text || text.indexOf('<tr') === -1) {
            return '';
        }
        return text;
    }

    function applySearchResult(html, noMoredata) {
        var rowsHtml = normalizeSearchHtml(html);
        var $trow = $('#trow');
        var hasRows = rowsHtml.length > 0 && rowsHtml.indexOf('vm-opr-table-empty-row') === -1;

        if (hasRows) {
            $trow.html(rowsHtml);
        } else {
            $trow.html(EMPTY_ROW_HTML);
        }

        if (typeof window.vmOprEnhanceTable === 'function') {
            window.vmOprEnhanceTable();
        }
        if (typeof window.vmOprOnSearchComplete === 'function') {
            window.vmOprOnSearchComplete({
                HTMLString: rowsHtml,
                NoMoredata: noMoredata !== undefined ? noMoredata : !hasRows
            });
        }
    }

    function runReportSearch($sourceForm) {
        var searchUrl = ($sourceForm && $sourceForm.attr('data-search-url'))
            || $('#operatorReportForm').attr('data-search-url')
            || '';

        if (!searchUrl || !$) {
            return;
        }

        $('#loadingdiv').show();

        $.ajax({
            url: searchUrl,
            type: 'POST',
            dataType: 'html',
            data: collectFilterPayload($sourceForm)
        }).done(function (html) {
            applySearchResult(html);
        }).fail(function () {
            $('#loadingdiv').hide();
        });
    }

    function maybeLoadInitialRows() {
        var $form = $('#operatorReportForm');
        var $trow = $('#trow');
        if (!$form.length || !$form.attr('data-search-url') || !$trow.length) {
            return;
        }
        if ($trow.find('tr').not('.vm-opr-table-empty-row').length > 0) {
            return;
        }
        runReportSearch($form);
    }

    function bindReportSearch() {
        if (!$) {
            return;
        }

        $('#operatorReportForm').off('submit.vmOprSearch').on('submit.vmOprSearch', function (e) {
            if (!$(this).attr('data-search-url')) {
                return true;
            }
            e.preventDefault();
            runReportSearch($(this));
            return false;
        });

        $('.vm-opr-consumer-search-form').off('submit.vmOprSearch').on('submit.vmOprSearch', function (e) {
            e.preventDefault();
            runReportSearch($(this));
            return false;
        });

        $('#operatorReportForm .vm-opr-toolbar-search').off('click.vmOprSearch').on('click.vmOprSearch', function (e) {
            var $form = $('#operatorReportForm');
            if (!$form.length || !$form.attr('data-search-url')) {
                return true;
            }
            e.preventDefault();
            runReportSearch($form);
            return false;
        });
    }

    function init() {
        resetStuckModals();
        bindModalCleanup();
        patchConverttoDate();
        patchBulkActionBar();
        enhanceTotalsPanel();
        normalizePortChips();
        bindPortChipActive();
        bindReportSearch();
        enhanceMobileTable();
        initSelects();
        maybeLoadInitialRows();

        if ($ && typeof MutationObserver !== 'undefined') {
            var tbody = document.querySelector('#' + TABLE_ID + ' tbody');
            if (tbody) {
                var observer = new MutationObserver(function () {
                    enhanceMobileTable();
                });
                observer.observe(tbody, { childList: true, subtree: true });
            }
        }
    }

    window.vmOprEnhanceTable = enhanceMobileTable;
    window.vmOprGetFilterPayload = function () {
        var payload = collectFilterPayload(null);
        var mob = $.trim($('#txtmob').val() || '');
        if (mob) {
            payload.txtmob = mob;
        }
        return payload;
    };
    window.vmOprResetModals = resetStuckModals;
    window.vmOprInitSelects = initOprSelects;
    window.vmOprShowCodeMode = showCodeMode;
    window.vmOprShowOperatorMode = showOperatorMode;
    window.vmOprUpdateTxtcodeOptions = updateTxtcodeOptions;
    window.vmOprAfterAnswers = afterAnswers;
    window.vmOprSetSelectIndex = setSelectIndex;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
