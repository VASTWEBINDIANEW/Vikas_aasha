(function ($) {
    'use strict';

    if (!$ || !$.fn) {
        return;
    }

    var SKIP_SELECTOR = '.vm-no-select2, [data-no-select2="true"]';
    var SKIP_AJAX_URL = /DistrictList|serchstates/i;
    var SEARCH_PLACEHOLDER = 'Search name, mobile, ID...';
    var BOOT_DELAYS = [0, 100, 250, 500, 900, 1400, 2200, 3200];
    var FINAL_BOOT_DELAYS = [0, 150, 400, 900, 1800, 2500, 4000];
    var POST_ADMIN_BOOT_DELAYS = [0, 50, 200, 450, 800, 1500];
    var select2Wrapped = false;
    var select2NativeFn = null;
    var observerStarted = false;
    var bootTimer = null;

    function isFundTransferPage() {
        return /Fund_transfer|FundTransferDealer|MDTODealer/i.test(window.location.pathname || '');
    }

    function hasSelect2() {
        return !!($.fn && $.fn.select2);
    }

    function wrapSelect2Plugin() {
        if (!hasSelect2()) {
            return;
        }

        if ($.fn.select2 && $.fn.select2.__vmAdminWrapped) {
            select2Wrapped = true;
            return;
        }

        var nativeSelect2 = $.fn.select2;
        if (!nativeSelect2) {
            return;
        }

        if (nativeSelect2.__vmAdminNative) {
            nativeSelect2 = nativeSelect2.__vmAdminNative;
        }

        select2NativeFn = nativeSelect2;

        function vmAdminSelect2(options) {
            if (arguments.length > 0 && typeof arguments[0] === 'string') {
                return nativeSelect2.apply(this, arguments);
            }

            var $first = this.first();
            var merged = $.extend({}, window.getAdminSelect2Options($first), options || {});

            if ($first.attr('data-live-search') === 'false') {
                merged.minimumResultsForSearch = Infinity;
                merged.dropdownCssClass = (merged.dropdownCssClass || '').replace(/\s*vm-admin-select2-searchable/g, '').trim();
                if (merged.dropdownCssClass.indexOf('vm-admin-select2-dropdown') === -1) {
                    merged.dropdownCssClass = 'vm-admin-select2-dropdown ' + merged.dropdownCssClass;
                }
            } else {
                merged.minimumResultsForSearch = 0;
                merged.dropdownCssClass = merged.dropdownCssClass || '';
                if (merged.dropdownCssClass.indexOf('vm-admin-select2-searchable') === -1) {
                    merged.dropdownCssClass += ' vm-admin-select2-searchable';
                }
            }

            if (!$first.attr('data-select2-dropdown-parent')) {
                merged.dropdownParent = window.getAdminSelect2DropdownParent($first);
            }

            return nativeSelect2.call(this, merged);
        }

        vmAdminSelect2.__vmAdminWrapped = true;
        vmAdminSelect2.__vmAdminNative = nativeSelect2;

        $.fn.select2 = vmAdminSelect2;

        if ($.noConflict) {
            var nativeNoConflict = $.noConflict;
            $.noConflict = function (removeAll) {
                var jq = nativeNoConflict.call($, removeAll);
                if (jq && jq.fn && !jq.fn.select2 && $.fn.select2) {
                    jq.fn.select2 = $.fn.select2;
                }
                return jq;
            };
        }

        select2Wrapped = true;
    }

    window.reconcileAdminSelect2Wrapper = function () {
        if ($.fn.select2 && !$.fn.select2.__vmAdminWrapped) {
            select2Wrapped = false;
        }
        wrapSelect2Plugin();
    };

    function destroySelectpicker($el) {
        if (!$el || !$el.length) {
            return;
        }

        if ($.fn.selectpicker) {
            try {
                if ($el.parent('.bootstrap-select').length || $el.hasClass('selectpicker')) {
                    $el.selectpicker('destroy');
                }
            } catch (ignoreDestroy) { }
        }

        $el.removeClass('selectpicker');
        if ($el.attr('data-live-search') !== 'false' && $el.attr('data_live_search') !== 'false') {
            $el.addClass('for-select2');
        }
    }

    function destroyAdminSelect2($el) {
        if (!$el || !$el.length || !hasSelect2()) {
            return;
        }
        if ($el.hasClass('select2-hidden-accessible')) {
            try {
                $el.select2('destroy');
            } catch (e) { /* ignore stale instances */ }
        }
        $el.removeClass('select2-hidden-accessible');
        $el.removeAttr('data-select2-id aria-hidden tabindex');
        $el.next('.select2-container').remove();
    }

    function hasSearchableAdminSelect2($el) {
        if (!$el || !$el.length || $el.attr('data-live-search') === 'false') {
            return $el && $el.length && isAdminSelect2Healthy($el);
        }

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

            return minSearch === 0 || minSearch === 1;
        } catch (ignore) {
            return false;
        }
    }

    function isAdminSelect2Healthy($el) {
        if (!$el || !$el.length) {
            return false;
        }
        var $container = $el.next('.select2-container');
        return $el.hasClass('select2-hidden-accessible') &&
            $container.length &&
            $container.find('.select2-selection').length;
    }

    function needsAdminSelect2Refresh($el) {
        if (!shouldInitSelect($el)) {
            return false;
        }
        if (!isAdminSelect2Healthy($el)) {
            return true;
        }
        if ($el.attr('data-live-search') === 'false') {
            return false;
        }
        return !hasSearchableAdminSelect2($el);
    }

    function isAdminSelect2CustomSkipped($el) {
        if (!$el || !$el.length) {
            return false;
        }
        if (!$el.is('[data-admin-select2-custom="true"]') && !$el.closest('[data-admin-select2-custom="true"]').length) {
            return false;
        }
        if ($el.closest('.vm-rl-create-drawer, .vm-csp-modal, .modal').length) {
            return false;
        }
        return true;
    }

    function shouldInitSelect($el) {
        if (!$el || !$el.length) {
            return false;
        }
        if ($el.is(SKIP_SELECTOR)) {
            destroyAdminSelect2($el);
            return false;
        }
        if ($el.hasClass('profileseclet') || $el.closest('.saas-prof-sec-control').length) {
            destroyAdminSelect2($el);
            return false;
        }
        if (isAdminSelect2CustomSkipped($el)) {
            return false;
        }
        if ($el.prop('disabled')) {
            return false;
        }

        if ($el.closest('.vm-rl-create-drawer').length) {
            return true;
        }

        var $modal = $el.closest('.modal');
        if ($modal.length) {
            /* Modal selects with for-select2 can init while hidden — avoids native dropdown on first open */
            if ($el.hasClass('for-select2') || $el.hasClass('vm-csp-modal-select') || $el.hasClass('vm-rl-select-search')) {
                return true;
            }
            if (!($modal.hasClass('in') || $modal.hasClass('show') || $modal.css('display') === 'block')) {
                return false;
            }
        } else if (!$el.is(':visible')) {
            if ($el.hasClass('for-select2') || $el.hasClass('vm-rl-select-search')) {
                return true;
            }
            return false;
        }
        if ($el.closest('.tab-pane:not(.active)').length) {
            return false;
        }
        if ($el.closest('.tab-contentt:not(.current)').length) {
            return false;
        }
        if (isFundTransferPage() && $el.closest('.saas-fund-transfer-page').length) {
            return false;
        }
        if ($el.closest('.saas-operator-report-page').length && $el.hasClass('vm-opr-select')) {
            if ($('#operatorReportForm').length) {
                return false;
            }
        }
        if ($el.closest('.saas-roffer-report-page').length && $el.hasClass('vm-opr-select')) {
            return false;
        }
        if ($el.closest('.vm-opr-filter-extra:not(.is-visible)').length) {
            destroyAdminSelect2($el);
            return false;
        }
        return true;
    }

    window.getAdminSelect2DropdownParent = function ($el) {
        if ($el && $el.length) {
            if ($el.closest('.vm-rl-create-drawer').length) {
                return $el.closest('.vm-rl-create-drawer').first();
            }
            if ($el.closest('.modal, .saas-admin-modal, [role="dialog"]').length) {
                return $el.closest('.modal, .saas-admin-modal, [role="dialog"]').first();
            }
        }
        return $(document.body);
    };

    window.getAdminSelect2Options = function ($el) {
        var opts = {
            width: '100%',
            dropdownAutoWidth: false,
            dropdownParent: window.getAdminSelect2DropdownParent($el),
            minimumResultsForSearch: 0,
            allowClear: false,
            dropdownCssClass: 'vm-admin-select2-dropdown vm-admin-select2-searchable',
            language: {
                noResults: function () { return 'No match found'; },
                searching: function () { return 'Searching...'; },
                inputTooShort: function () { return 'Type to search...'; }
            }
        };

        if ($el && $el.attr('data-live-search') === 'false') {
            opts.minimumResultsForSearch = Infinity;
            opts.dropdownCssClass = 'vm-admin-select2-dropdown';
        }

        if ($el && $el.closest('.modal, .saas-admin-modal, [role="dialog"]').length) {
            opts.dropdownCssClass += ' vm-csp-select2-dropdown';
        }

        return opts;
    };

    window.normalizeSelectListData = function (data) {
        var rows = [];
        var i;
        if (!data) {
            return rows;
        }
        if (!$.isArray(data)) {
            return rows;
        }
        for (i = 0; i < data.length; i++) {
            rows.push({
                value: data[i].Value != null ? data[i].Value : data[i].value,
                text: data[i].Text != null ? data[i].Text : data[i].text
            });
        }
        return rows;
    };

    window.buildSelectOptionsHtml = function (data, placeholder) {
        var html = '<option value="0">' + (placeholder || 'Select') + '</option>';
        var rows = window.normalizeSelectListData(data);
        var i;
        for (i = 0; i < rows.length; i++) {
            html += '<option value="' + rows[i].value + '">' + rows[i].text + '</option>';
        }
        return html;
    };

    window.setAdminSelect2Html = function (el, html, selectedValue) {
        var $el = $(el);
        if (!$el.length) {
            return;
        }
        destroyAdminSelect2($el);
        $el.html(html);
        if (selectedValue != null && selectedValue !== '') {
            $el.val(String(selectedValue));
        }
        $el.select2(window.getAdminSelect2Options($el));
        forceSelect2SearchAlways($el);
        bindAdminSelect2SearchBehavior($el);
        $el.trigger('change.select2');
    };

    function buildAdminEmptySelectHtml(placeholder, emptyValue) {
        if (emptyValue === '' || emptyValue == null) {
            return '<option value="">' + (placeholder || 'Select') + '</option>';
        }
        return window.buildSelectOptionsHtml(null, placeholder);
    }

    window.loadAdminDistrictSelect = function (districtEl, stateId, url, options) {
        var $district = $(districtEl);
        var cfg = $.extend({
            placeholder: 'Select District',
            loadingText: 'Please wait...',
            method: 'POST',
            paramName: 'Id',
            emptyValue: '0'
        }, options || {});

        if (!$district.length || !url) {
            return $.Deferred().reject().promise();
        }

        if (!stateId || stateId === '0' || stateId === 'N') {
            window.setAdminSelect2Html(
                $district[0],
                buildAdminEmptySelectHtml(cfg.placeholder, cfg.emptyValue),
                cfg.emptyValue
            );
            return $.Deferred().resolve([]).promise();
        }

        window.setAdminSelect2Html(
            $district[0],
            buildAdminEmptySelectHtml(cfg.loadingText, cfg.emptyValue),
            cfg.emptyValue
        );

        var ajaxData = {};
        ajaxData[cfg.paramName] = stateId;

        return $.ajax({
            url: url,
            data: ajaxData,
            cache: false,
            type: cfg.method,
            dataType: 'json'
        }).done(function (data) {
            var html = buildAdminEmptySelectHtml(cfg.placeholder, cfg.emptyValue);
            var rows = window.normalizeSelectListData(data);
            var i;
            for (i = 0; i < rows.length; i++) {
                html += '<option value="' + rows[i].value + '">' + rows[i].text + '</option>';
            }
            window.setAdminSelect2Html($district[0], html, cfg.emptyValue);
        }).fail(function (xhr) {
            window.setAdminSelect2Html(
                $district[0],
                buildAdminEmptySelectHtml(cfg.placeholder, cfg.emptyValue),
                cfg.emptyValue
            );
            if (cfg.onError) {
                cfg.onError(xhr);
            }
        });
    };

    window.bindAdminStateDistrict = function (stateSelector, districtSelector, url, options) {
        var cfg = $.extend({
            placeholder: 'Select District',
            method: 'POST'
        }, options || {});

        $(document)
            .off('change.vmAdminStateDistrict select2:select.vmAdminStateDistrict', stateSelector)
            .on('change.vmAdminStateDistrict select2:select.vmAdminStateDistrict', stateSelector, function () {
                window.loadAdminDistrictSelect(
                    districtSelector,
                    $(this).val(),
                    url,
                    cfg
                );
            });

        $(stateSelector).each(function () {
            $(this).attr('data-vm-admin-district-bound', 'true');
        });
    };

    window.applyAdminSelect2 = function ($el, extraOptions, force) {
        if (!$el || !$el.length) {
            return;
        }
        wrapSelect2Plugin();
        if (!hasSelect2()) {
            return;
        }
        $el.each(function () {
            var $one = $(this);
            if (!$one.is('select')) {
                return;
            }
            if ($one.is(SKIP_SELECTOR) || $one.hasClass('profileseclet') || $one.closest('.saas-prof-sec-control').length) {
                return;
            }
            if (isAdminSelect2CustomSkipped($one)) {
                return;
            }
            if (!force && !shouldInitSelect($one)) {
                return;
            }
            destroySelectpicker($one);
            destroyAdminSelect2($one);
            $one.select2($.extend({}, window.getAdminSelect2Options($one), extraOptions || {}));
            forceSelect2SearchAlways($one);
            bindAdminSelect2SearchBehavior($one);
        });
    };

    window.initAdminForSelect2 = function ($scope) {
        var $root = ($scope && $scope.length) ? $scope : $(document);
        window.applyAdminSelect2($root.find('.for-select2, .vm-admin-select-search, .vm-rl-select-search, .vm-opr-select, .select2-inside-modal'));
    };

    window.forceAdminSelect2 = function ($el, extraOptions, forceRebuild) {
        if (!$el || !$el.length) {
            return;
        }
        wrapSelect2Plugin();
        if (!hasSelect2()) {
            return;
        }
        if (!forceRebuild && !needsAdminSelect2Refresh($el)) {
            forceSelect2SearchAlways($el);
            bindAdminSelect2SearchBehavior($el);
            return;
        }
        destroySelectpicker($el);
        destroyAdminSelect2($el);
        $el.select2($.extend({}, window.getAdminSelect2Options($el), extraOptions || {}));
        forceSelect2SearchAlways($el);
        bindAdminSelect2SearchBehavior($el);
    };

    window.initAdminModalSelect2 = function ($modal) {
        if (!$modal || !$modal.length) {
            $modal = $('.modal.in, .modal.show').filter(function () {
                return $(this).css('display') === 'block';
            }).last();
        }
        if (!$modal || !$modal.length) {
            return;
        }
        wrapSelect2Plugin();
        if (!hasSelect2()) {
            return;
        }
        $modal.find('select').each(function () {
            var $one = $(this);
            if ($one.is(SKIP_SELECTOR) || $one.hasClass('profileseclet') || $one.closest('.saas-prof-sec-control').length) {
                return;
            }
            if (isAdminSelect2CustomSkipped($one)) {
                return;
            }
            if ($one.attr('data-live-search') === 'false') {
                if (needsAdminSelect2Refresh($one)) {
                    window.forceAdminSelect2($one, {
                        width: '100%',
                        dropdownParent: $(document.body),
                        minimumResultsForSearch: Infinity
                    });
                }
                return;
            }
            if (!needsAdminSelect2Refresh($one)) {
                forceSelect2SearchAlways($one);
                bindAdminSelect2SearchBehavior($one);
                return;
            }
            window.forceAdminSelect2($one, {
                width: '100%',
                dropdownParent: $(document.body),
                minimumResultsForSearch: 0,
                dropdownCssClass: 'vm-admin-select2-dropdown vm-admin-select2-searchable vm-csp-select2-dropdown'
            });
        });
    };

    var ADMIN_STATE_DISTRICT_PAIRS = [
        { state: '#State', district: '#District' },
        { state: '#State1', district: '#District1' },
        { state: '#vmRlCreateState', district: '#vmRlCreateDistrict' },
        { state: '#serbystsdst', district: '#Districtstates', urlKey: 'area' }
    ];

    window.autoBindAdminStateDistrictPairs = function () {
        var defaultUrl = window.adminDistrictListUrl;
        var areaUrl = window.adminAreaDistrictUrl || defaultUrl;
        var i;
        if (!window.bindAdminStateDistrict) {
            return;
        }
        for (i = 0; i < ADMIN_STATE_DISTRICT_PAIRS.length; i++) {
            var pair = ADMIN_STATE_DISTRICT_PAIRS[i];
            var url;
            if (pair.urlKey === 'area') {
                url = areaUrl;
            } else if (pair.urlKey === 'radiantRef') {
                url = window.radiantRefDistrictUrl;
            } else {
                url = defaultUrl;
            }
            if (!url || !$(pair.state).length || !$(pair.district).length) {
                continue;
            }
            if ($(pair.state).attr('data-vm-admin-district-bound') === 'true') {
                continue;
            }
            window.bindAdminStateDistrict(pair.state, pair.district, url, {
                placeholder: pair.placeholder || 'Select District',
                method: pair.method || 'POST',
                paramName: pair.paramName || 'Id',
                emptyValue: pair.emptyValue != null ? pair.emptyValue : '0'
            });
        }
    };

    function isDealerFundTransferPage() {
        return /FundTransferDealer|MDTODealer/i.test(window.location.pathname || '');
    }

    window.refreshAdminSelect2 = function ($scope) {
        wrapSelect2Plugin();

        if (!hasSelect2()) {
            return;
        }

        if (isFundTransferPage() && (!$scope || !$scope.length)) {
            if (isDealerFundTransferPage() && typeof window.initDealerFundTransferPageSelect2 === 'function') {
                window.initDealerFundTransferPageSelect2();
            } else if (typeof window.refreshFundTransferSelect2 === 'function') {
                window.refreshFundTransferSelect2();
            }
            if (typeof window.refreshFundTransferHistorySelect2 === 'function') {
                window.refreshFundTransferHistorySelect2();
            }
            return;
        }

        var $roots;
        if ($scope && $scope.length) {
            $roots = $scope;
        } else {
            $roots = $('body.saas-admin-ui');
        }

        $roots.each(function () {
            $(this).find('select').each(function () {
                var $el = $(this);

                if (!needsAdminSelect2Refresh($el)) {
                    if (isAdminSelect2Healthy($el)) {
                        forceSelect2SearchAlways($el);
                        bindAdminSelect2SearchBehavior($el);
                    }
                    return;
                }

                destroySelectpicker($el);
                destroyAdminSelect2($el);
                $el.select2(window.getAdminSelect2Options($el));
                forceSelect2SearchAlways($el);
                bindAdminSelect2SearchBehavior($el);
            });
        });
    };

    window.hasSearchableAdminSelect2 = hasSearchableAdminSelect2;
    window.needsAdminSelect2Refresh = needsAdminSelect2Refresh;

    function getSearchPlaceholderForSelect($el) {
        var customPh;
        if (!$el || !$el.length) {
            return SEARCH_PLACEHOLDER;
        }
        customPh = $el.attr('data-search-placeholder') || $el.attr('data-placeholder') || $el.attr('title');
        if (customPh) {
            return customPh;
        }
        if ($el.hasClass('vm-rl-select-search') || $el.hasClass('vm-dmt-select')) {
            return SEARCH_PLACEHOLDER;
        }
        var idName = (($el.attr('id') || '') + ' ' + ($el.attr('name') || '')).toLowerCase();
        if (/dealer|distributor|retailer|firm|user|mobile|master|api|whitelabel/.test(idName)) {
            return SEARCH_PLACEHOLDER;
        }
        if (/operator|apinm|status|type|category/.test(idName)) {
            return 'Search...';
        }
        return 'Search...';
    }

    window.getAdminSelect2SearchPlaceholder = getSearchPlaceholderForSelect;
    window.isAdminSelect2Healthy = isAdminSelect2Healthy;

    function migrateSelectpickerToSelect2($scope) {
        if (!hasSelect2()) {
            return;
        }

        var $root = ($scope && $scope.length) ? $scope : $('body.saas-admin-ui');
        $root.find('select.selectpicker, .bootstrap-select select').each(function () {
            var $el = $(this);
            if ($el.is(SKIP_SELECTOR) || $el.hasClass('profileseclet')) {
                return;
            }
            if ($el.hasClass('select2-hidden-accessible')) {
                return;
            }
            destroySelectpicker($el);
        });
    }

    function syncOpenSelect2ZIndex() {
        var $modal = $('.modal.in, .modal.show').filter(function () {
            return $(this).css('display') === 'block';
        }).last();

        if (!$modal.length) {
            return;
        }

        var modalZ = parseInt($modal.css('z-index'), 10) || 11000;
        var dropZ = modalZ + 60;

        $('.select2-container--open').css('z-index', dropZ);
        $('body > .select2-container.select2-container--open').css('z-index', dropZ);
        $('.select2-dropdown').css('z-index', dropZ + 1);
    }

    function forceSelect2SearchAlways($select) {
        var inst;
        var $searchWrap;

        if (!$select || !$select.length || $select.attr('data-live-search') === 'false') {
            return;
        }

        inst = $select.data('select2');
        if (!inst || !inst.dropdown) {
            return;
        }

        inst.dropdown.showSearch = function () {
            return true;
        };

        $searchWrap = inst.dropdown.$searchContainer;
        if (!$searchWrap || !$searchWrap.length) {
            if (inst.$dropdown && inst.$dropdown.length) {
                $searchWrap = inst.$dropdown.find('.select2-search--dropdown').first();
            } else {
                $searchWrap = $('.select2-container--open').last().siblings('.select2-dropdown').find('.select2-search--dropdown').first();
            }
        }

        if ($searchWrap && $searchWrap.length) {
            $searchWrap.removeClass('select2-search--hide').css({
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                height: 'auto',
                minHeight: '52px',
                maxHeight: 'none',
                overflow: 'visible',
                pointerEvents: 'auto'
            });
        }

        if (inst.dropdown.$search && inst.dropdown.$search.length) {
            inst.dropdown.$search.css({
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                width: '100%',
                minHeight: '38px',
                pointerEvents: 'auto'
            });
        }

        if (inst.$dropdown && inst.$dropdown.length) {
            inst.$dropdown.find('.select2-search--dropdown').removeClass('select2-search--hide').show();
        }
    }

    window.forceAdminSelect2SearchAlways = forceSelect2SearchAlways;

    function bindAdminSelect2SearchBehavior($select) {
        if (!$select || !$select.length || $select.attr('data-live-search') === 'false') {
            return;
        }

        $select.off('select2:open.vmAdminForceSearch');
        $select.on('select2:open.vmAdminForceSearch', function () {
            var placeholder = getSearchPlaceholderForSelect($select);
            var tries = 0;

            function pollSearch() {
                tries += 1;
                forceSelect2SearchAlways($select);
                ensureSelect2SearchVisible($select, placeholder);
                if (tries < 15) {
                    window.setTimeout(pollSearch, 25);
                }
            }

            pollSearch();
        });
    }

    function injectSelect2SearchBox($dropdown, $select, placeholder) {
        var inst = $select && $select.length ? $select.data('select2') : null;
        var $box;
        var $field;

        if (!$dropdown || !$dropdown.length) {
            if (inst && inst.$dropdown) {
                $dropdown = inst.$dropdown;
            } else {
                $dropdown = $('body > .select2-dropdown').last();
            }
        }

        if (!$dropdown.length) {
            return $();
        }

        $box = $dropdown.find('.select2-search--dropdown').first();
        if (!$box.length) {
            $box = $(
                '<span class="select2-search select2-search--dropdown">' +
                '<input class="select2-search__field" type="search" tabindex="0" autocomplete="off" ' +
                'autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" />' +
                '</span>'
            );
            $dropdown.prepend($box);

            $field = $box.find('.select2-search__field');
            $field.on('input.vmAdminSelect2Search keyup.vmAdminSelect2Search', function () {
                var term = $(this).val();
                if (inst && typeof inst.trigger === 'function') {
                    inst.trigger('query', { term: term });
                }
            });
        }

        return $box;
    }

    function ensureSelect2SearchVisible($select, placeholder) {
        var inst = $select && $select.length ? $select.data('select2') : null;
        var $dropdown = $();
        var $searchContainer = $();
        var $search = $();

        if (inst) {
            if (inst.options && typeof inst.options.set === 'function') {
                try {
                    inst.options.set('minimumResultsForSearch', 0);
                } catch (ignoreOpt) { }
            }
            if (inst.$dropdown) {
                $dropdown = inst.$dropdown;
            }
        }

        if (inst && inst.dropdown && inst.dropdown.$searchContainer && inst.dropdown.$searchContainer.length) {
            $searchContainer = inst.dropdown.$searchContainer;
            $search = inst.dropdown.$search || $searchContainer.find('.select2-search__field');
        }

        if (inst && inst.dropdown && inst.dropdown.$search) {
            $search = inst.dropdown.$search;
            if (!$searchContainer.length && $search.parent('.select2-search--dropdown').length) {
                $searchContainer = $search.parent('.select2-search--dropdown');
            }
        }

        if (!$search.length) {
            $searchContainer = $('.select2-dropdown--below .select2-search--dropdown, .select2-dropdown--above .select2-search--dropdown').last();
            if (!$searchContainer.length) {
                $searchContainer = $('.select2-search--dropdown').last();
            }
            $search = $searchContainer.find('.select2-search__field');
        }

        if (!$searchContainer.length || !$search.length) {
            $searchContainer = injectSelect2SearchBox($dropdown, $select, placeholder);
            $search = $searchContainer.find('.select2-search__field');
        }

        if ($searchContainer.length) {
            $searchContainer.removeClass('select2-search--hide').css({
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                height: 'auto',
                minHeight: '52px',
                maxHeight: 'none',
                overflow: 'visible',
                pointerEvents: 'auto'
            });
        }

        if ($search.length) {
            $search.attr('placeholder', placeholder || 'Search...');
            $search.prop('readonly', false).prop('disabled', false);
            $search.css({
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                width: '100%',
                minHeight: '38px',
                pointerEvents: 'auto',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                cursor: 'text'
            });
            window.setTimeout(function () {
                try {
                    $search.trigger('focus');
                } catch (ignore) { }
            }, 0);
        }

        if ($select && $select.closest('.modal').length) {
            $select.closest('.modal').addClass('vm-admin-select2-open');
            syncOpenSelect2ZIndex();
        }
    }

    window.ensureAdminSelect2SearchVisible = ensureSelect2SearchVisible;

    function bindSelect2SearchUi() {
        $(document).off('mousedown.vmAdminSelect2Search click.vmAdminSelect2Search', '.select2-search--dropdown, .select2-search__field');
        $(document).on('mousedown.vmAdminSelect2Search click.vmAdminSelect2Search', '.select2-search--dropdown, .select2-search__field', function (e) {
            e.stopPropagation();
        });

        $(document).off('select2:open.vmAdminSelect2').on('select2:open.vmAdminSelect2', function (e) {
            var $select = $(e.target);
            var placeholder = getSearchPlaceholderForSelect($select);

            forceSelect2SearchAlways($select);
            bindAdminSelect2SearchBehavior($select);
            ensureSelect2SearchVisible($select, placeholder);
            window.setTimeout(function () {
                forceSelect2SearchAlways($select);
                ensureSelect2SearchVisible($select, placeholder);
            }, 0);
            window.setTimeout(function () {
                forceSelect2SearchAlways($select);
                ensureSelect2SearchVisible($select, placeholder);
            }, 50);
            window.setTimeout(function () {
                forceSelect2SearchAlways($select);
                ensureSelect2SearchVisible($select, placeholder);
            }, 120);
        });

        $(document).off('select2:close.vmAdminSelect2').on('select2:close.vmAdminSelect2', function (e) {
            $(e.target).closest('.modal').removeClass('vm-admin-select2-open');
        });
    }

    function syncLegacyJqSelect2() {
        if (!$.fn || !$.fn.select2) {
            return;
        }
        if (window.ravi && window.ravi.fn && !window.ravi.fn.select2) {
            window.ravi.fn.select2 = $.fn.select2;
        }
    }

    function bootAdminSelect2() {
        window.reconcileAdminSelect2Wrapper();
        if (!hasSelect2()) {
            return;
        }
        syncLegacyJqSelect2();
        bindSelect2SearchUi();
        migrateSelectpickerToSelect2();
        window.autoBindAdminStateDistrictPairs();
        window.refreshAdminSelect2();
    }

    window.bootAdminSelect2 = bootAdminSelect2;
    window.initAdminSelectSearch = bootAdminSelect2;

    function scheduleBoots(delays) {
        var list = delays || BOOT_DELAYS;
        var i;
        for (i = 0; i < list.length; i++) {
            window.setTimeout(bootAdminSelect2, list[i]);
        }
    }

    window.finalizeAdminSelect2Boot = function () {
        bootAdminSelect2();
        scheduleBoots(FINAL_BOOT_DELAYS);
    };

    window.bootAdminSelect2AfterAdminShell = function () {
        if (!$('body.saas-admin-ui').length) {
            return;
        }
        window.reconcileAdminSelect2Wrapper();
        migrateSelectpickerToSelect2();
        bootAdminSelect2();
        scheduleBoots(POST_ADMIN_BOOT_DELAYS);
    };

    function queueBoot(delay) {
        window.clearTimeout(bootTimer);
        bootTimer = window.setTimeout(bootAdminSelect2, delay || 280);
    }

    function startDomObserver() {
        if (observerStarted || !window.MutationObserver || !document.body) {
            return;
        }

        var observer = new MutationObserver(function (mutations) {
            var i;
            var j;
            var addedSelect = false;

            for (i = 0; i < mutations.length; i++) {
                if (!mutations[i].addedNodes || !mutations[i].addedNodes.length) {
                    continue;
                }
                for (j = 0; j < mutations[i].addedNodes.length; j++) {
                    var node = mutations[i].addedNodes[j];
                    if (node.nodeType !== 1) {
                        continue;
                    }
                    if (node.tagName === 'SELECT' || (node.querySelector && node.querySelector('select'))) {
                        addedSelect = true;
                        break;
                    }
                }
                if (addedSelect) {
                    break;
                }
            }

            if (addedSelect) {
                queueBoot(80);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        observerStarted = true;
    }

    $(function () {
        scheduleBoots();
        startDomObserver();
    });

    $(window).on('load', function () {
        scheduleBoots();
        startDomObserver();
    });

    $(document).ajaxComplete(function (event, xhr, settings) {
        var url = (settings && settings.url) ? String(settings.url) : '';
        if (SKIP_AJAX_URL.test(url)) {
            return;
        }
        queueBoot(150);
    });

    $(document).on('shown.bs.modal show.bs.modal', '.modal', function () {
        var $modal = $(this);
        window.setTimeout(function () {
            window.initAdminModalSelect2($modal);
        }, 0);
        window.setTimeout(function () {
            window.initAdminModalSelect2($modal);
        }, 120);
        window.setTimeout(function () {
            window.initAdminModalSelect2($modal);
        }, 350);
    });

    $(document).on('click', '[data-toggle="modal"][data-target], [data-bs-toggle="modal"][data-target], [data-bs-toggle="modal"][data-bs-target]', function () {
        var target = $(this).attr('data-target') || $(this).attr('data-bs-target');
        if (!target) {
            return;
        }
        window.setTimeout(function () {
            window.initAdminModalSelect2($(target));
        }, 200);
        window.setTimeout(function () {
            window.initAdminModalSelect2($(target));
        }, 550);
    });

    $(document).on('shown.bs.tab', '[data-toggle="tab"], [data-bs-toggle="tab"]', function () {
        queueBoot(100);
    });

    $(document).on('click', 'ul#tabs li, .tab-contentt .tab-link a, .tab-contentt .tab-link, .ap-segment-btn, .tab-link2, .tab-link.ap-left-tab, .tab-link.ap-right-tab, .vm-ft-role-tab-li', function () {
        queueBoot(120);
    });

    if ($('body.saas-admin-ui').length) {
        $(window).on('load', function () {
            window.setTimeout(function () {
                window.bootAdminSelect2AfterAdminShell();
            }, 100);
            window.setTimeout(function () {
                window.bootAdminSelect2AfterAdminShell();
            }, 600);
        });
    }

    $(function () {
        if (!$('body.saas-admin-ui').length) {
            return;
        }
        $('.modal select.for-select2, .modal select.vm-csp-modal-select, .modal select.vm-rl-select-search').each(function () {
            var $one = $(this);
            if (needsAdminSelect2Refresh($one)) {
                window.forceAdminSelect2($one, {
                    width: '100%',
                    minimumResultsForSearch: 0,
                    dropdownParent: $(document.body),
                    dropdownCssClass: 'vm-admin-select2-dropdown vm-admin-select2-searchable vm-csp-select2-dropdown'
                });
            }
        });
    });

})(window.vmAdminJq || window.jQuery);
