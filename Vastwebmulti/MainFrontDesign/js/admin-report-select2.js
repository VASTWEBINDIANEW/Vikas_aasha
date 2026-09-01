/**
 * ADMIN — Financial / operator report pages Select2 helper v=3
 * Searchable dropdowns + dependent filter visibility (Hotel Report pattern).
 */
(function (window, document, $) {
    'use strict';

    if (!$) {
        return;
    }

    var FILTER_WRAP_IDS = [
        'allmaster', 'allmaster1', 'allmaster2',
        'dlm', 'rem', 'apiid', 'whitelabelid',
        'allwhitelabel', 'allwhitelabel1', 'Whitelabel',
        'ticket-wrap-whitelabel', 'ticket-wrap-master'
    ];

    var REPORT_SELECT_SELECTOR = [
        'select.vm-opr-select',
        'select.vm-dmt-select',
        'select.for-select2',
        '.vm-rpt-filters-panel select.form-control',
        '.vm-opr-filter-toolbar select.form-control',
        '.saas-acc-filter-bar select.form-control'
    ].join(', ');

    function isReportPage() {
        return $('.saas-operator-report-page').length && !$('#operatorReportForm').length;
    }

    function isHealthy($el) {
        if (window.isAdminSelect2Healthy) {
            return window.isAdminSelect2Healthy($el);
        }
        return $el.hasClass('select2-hidden-accessible') && $el.next('.select2-container').length;
    }

    function hasSearchableSelect2($el) {
        try {
            var inst = $el.data('select2');
            var minSearch;

            if (!inst || !inst.options) {
                return false;
            }

            if (typeof inst.options.get === 'function') {
                minSearch = inst.options.get('minimumResultsForSearch');
            } else if (typeof inst.options.minimumResultsForSearch !== 'undefined') {
                minSearch = inst.options.minimumResultsForSearch;
            } else {
                return false;
            }

            return minSearch === 0;
        } catch (err) {
            return false;
        }
    }

    function getDropdownParent($el) {
        var $panel = $el.closest('.vm-rpt-filters-panel, .saas-acc-filter-bar, .vm-opr-filter-row, .vm-opr-toolbar-unified');
        return $panel.length ? $panel.first() : $(document.body);
    }

    function ensureReportSelect2($el) {
        if (!$el || !$el.length || $el.prop('disabled')) {
            return;
        }

        var $wrap = $el.closest('.vm-opr-filter-extra');
        if ($wrap.length && !$wrap.hasClass('is-visible')) {
            return;
        }
        if (!$el.is(':visible')) {
            return;
        }
        if (!$.fn.select2) {
            return;
        }

        var extraOptions = {
            dropdownParent: getDropdownParent($el)
        };

        if (isHealthy($el) && hasSearchableSelect2($el)) {
            return;
        }

        if (typeof window.applyAdminSelect2 === 'function') {
            window.applyAdminSelect2($el, extraOptions, true);
            return;
        }

        if (isHealthy($el)) {
            $el.select2('destroy');
        }

        $el.select2($.extend({}, window.getAdminSelect2Options($el), extraOptions));
    }

    window.showReportFilterExtra = function (id) {
        var el = document.getElementById(id);

        if (!el) {
            return;
        }

        $(el)
            .addClass('is-visible')
            .removeAttr('hidden')
            .css({ display: '' });
    };

    window.hideReportFilterExtra = function (id) {
        var el = document.getElementById(id);

        if (!el) {
            return;
        }

        $(el)
            .removeClass('is-visible')
            .attr('hidden', 'hidden')
            .css({ display: 'none' });
    };

    function shouldShowFilterWrap(el) {
        var $wrap = $(el);
        var inlineDisplay = el.style.display;

        if (inlineDisplay === 'block' || inlineDisplay === 'flex' || inlineDisplay === '') {
            if (inlineDisplay === 'none') {
                return false;
            }
            if ($wrap.hasClass('is-visible')) {
                return true;
            }
            if (inlineDisplay === 'block' || inlineDisplay === 'flex') {
                return true;
            }
        }

        if ($wrap.hasClass('is-visible')) {
            return true;
        }

        if ($wrap.is(':visible') && inlineDisplay !== 'none') {
            return true;
        }

        return false;
    }

    function syncFilterExtraVisibility() {
        var i;
        var el;

        for (i = 0; i < FILTER_WRAP_IDS.length; i++) {
            el = document.getElementById(FILTER_WRAP_IDS[i]);
            if (!el) {
                continue;
            }
            if (shouldShowFilterWrap(el)) {
                window.showReportFilterExtra(FILTER_WRAP_IDS[i]);
            } else if (el.style.display === 'none' || el.hasAttribute('hidden')) {
                window.hideReportFilterExtra(FILTER_WRAP_IDS[i]);
            }
        }

        $('.saas-operator-report-page .vm-opr-filter-extra').each(function () {
            el = this;
            if (!el.id) {
                return;
            }
            if (shouldShowFilterWrap(el)) {
                window.showReportFilterExtra(el.id);
            } else if (el.style.display === 'none') {
                window.hideReportFilterExtra(el.id);
            }
        });
    }

    window.initReportPageSelects = function ($scope) {
        if (!isReportPage()) {
            return;
        }

        var $root = ($scope && $scope.length) ? $scope : $('.saas-operator-report-page');

        $root.find(REPORT_SELECT_SELECTOR).each(function () {
            ensureReportSelect2($(this));
        });
    };

    function refreshAfterFilterChange() {
        syncFilterExtraVisibility();
        window.setTimeout(window.initReportPageSelects, 0);
        window.setTimeout(window.initReportPageSelects, 120);
        window.setTimeout(window.initReportPageSelects, 350);
    }

    function patchFn(name) {
        var original = window[name];

        if (typeof original !== 'function' || original.__vmReportSelectPatched) {
            return;
        }

        window[name] = function () {
            var result = original.apply(this, arguments);
            refreshAfterFilterChange();
            return result;
        };
        window[name].__vmReportSelectPatched = true;
    }

    function patchAnswerHandlers() {
        patchFn('answers');
        patchFn('answers1');
    }

    function bindUserTypeChange() {
        $(document)
            .off('change.vmReportUserType select2:select.vmReportUserType', '.saas-operator-report-page #ddlusers')
            .on('change.vmReportUserType select2:select.vmReportUserType', '.saas-operator-report-page #ddlusers', function () {
                if (typeof window.answers === 'function') {
                    window.answers();
                } else {
                    refreshAfterFilterChange();
                }
            });
    }

    function bindSearchFocus() {
        $(document)
            .off('select2:open.vmReportSelectSearch')
            .on('select2:open.vmReportSelectSearch', '.saas-operator-report-page select', function () {
                var ph = 'Search...';

                if (typeof window.getAdminSelect2SearchPlaceholder === 'function') {
                    ph = window.getAdminSelect2SearchPlaceholder($(this));
                }

                window.setTimeout(function () {
                    var $field = $('.select2-container--open .select2-search__field');

                    if ($field.length) {
                        $field.attr('placeholder', ph);
                        $field.trigger('focus');
                    }
                }, 0);
            });
    }

    function initUserTypeOnLoad() {
        var $ddl = $('#ddlusers');

        if (!$ddl.length) {
            return;
        }

        if (typeof window.answers === 'function') {
            window.answers();
        }

        refreshAfterFilterChange();
    }

    function scheduleInits() {
        var delays = [0, 350, 800, 1800, 3000];
        var i;

        for (i = 0; i < delays.length; i++) {
            (function (delay) {
                window.setTimeout(function () {
                    syncFilterExtraVisibility();
                    window.initReportPageSelects();
                }, delay);
            }(delays[i]));
        }
    }

    function boot() {
        if (!isReportPage()) {
            return;
        }

        patchAnswerHandlers();
        bindUserTypeChange();
        bindSearchFocus();
        initUserTypeOnLoad();
        scheduleInits();
    }

    $(function () {
        boot();
    });

    $(window).on('load', function () {
        window.setTimeout(boot, 120);
    });

    window.addEventListener('pageshow', function () {
        window.setTimeout(boot, 50);
    });

    $(document).ajaxComplete(function (_evt, _xhr, settings) {
        var url = (settings && settings.url) ? String(settings.url) : '';

        if (/DistrictList|serchstates/i.test(url)) {
            return;
        }
        if (!isReportPage()) {
            return;
        }

        window.setTimeout(refreshAfterFilterChange, 200);
    });

})(window, document, window.jQuery);
