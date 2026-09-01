(function ($) {
    'use strict';

    if (!$ || !$.fn) {
        return;
    }

    var SKIP_SELECTOR = '.vm-no-select2, [data-no-select2="true"]';
    var SKIP_AJAX_URL = /DistrictList|serchstates/i;
    var SEARCH_PLACEHOLDER = 'Search name, mobile, ID...';
    var BOOT_DELAYS = [0, 100, 250, 500, 900, 1400, 2200, 3200];
    var FINAL_BOOT_DELAYS = [0, 150, 400, 900, 1800];
    var select2Wrapped = false;
    var observerStarted = false;
    var bootTimer = null;

    function isFundTransferPage() {
        return /Fund_transfer/i.test(window.location.pathname || '');
    }

    function hasSelect2() {
        return !!($.fn && $.fn.select2);
    }

    function wrapSelect2Plugin() {
        if (select2Wrapped || !hasSelect2()) {
            return;
        }

        var nativeSelect2 = $.fn.select2;

        $.fn.select2 = function (options) {
            if (arguments.length > 0 && typeof arguments[0] === 'string') {
                return nativeSelect2.apply(this, arguments);
            }

            var $first = this.first();
            var merged = $.extend({}, window.getAdminSelect2Options($first), options || {});

            if ($first.attr('data-live-search') === 'false') {
                merged.minimumResultsForSearch = Infinity;
            } else {
                merged.minimumResultsForSearch = 0;
            }

            return nativeSelect2.call(this, merged);
        };

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

    function isAdminSelect2Healthy($el) {
        if (!$el || !$el.length) {
            return false;
        }
        var $container = $el.next('.select2-container');
        return $el.hasClass('select2-hidden-accessible') &&
            $container.length &&
            $container.find('.select2-selection').length;
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
        if ($el.is('[data-admin-select2-custom="true"]') || $el.closest('[data-admin-select2-custom="true"]').length) {
            return false;
        }
        if ($el.prop('disabled')) {
            return false;
        }
        if (!$el.is(':visible')) {
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

    window.getAdminSelect2Options = function ($el) {
        var opts = {
            width: '100%',
            dropdownAutoWidth: false,
            dropdownParent: $(document.body),
            minimumResultsForSearch: 0,
            allowClear: false,
            language: {
                noResults: function () { return 'No match found'; },
                searching: function () { return 'Searching...'; },
                inputTooShort: function () { return 'Type to search...'; }
            }
        };

        if ($el && $el.attr('data-live-search') === 'false') {
            opts.minimumResultsForSearch = Infinity;
        }

        var $modal = $el.closest('.modal, .vm-rl-create-drawer, .drawer, [role="dialog"]');
        if ($modal.length) {
            opts.dropdownParent = $(document.body);
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
            if (!force && !shouldInitSelect($one)) {
                return;
            }
            destroyAdminSelect2($one);
            $one.select2($.extend({}, window.getAdminSelect2Options($one), extraOptions || {}));
        });
    };

    window.initAdminForSelect2 = function ($scope) {
        var $root = ($scope && $scope.length) ? $scope : $(document);
        window.applyAdminSelect2($root.find('.for-select2, .vm-admin-select-search, .vm-rl-select-search, .vm-opr-select, .select2-inside-modal'));
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

    window.refreshAdminSelect2 = function ($scope) {
        wrapSelect2Plugin();

        if (!hasSelect2()) {
            return;
        }

        if (isFundTransferPage() && (!$scope || !$scope.length)) {
            if (typeof window.refreshFundTransferSelect2 === 'function') {
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

                if (!shouldInitSelect($el)) {
                    return;
                }

                if (isAdminSelect2Healthy($el)) {
                    return;
                }

                destroyAdminSelect2($el);
                $el.select2(window.getAdminSelect2Options($el));
            });
        });
    };

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

    function bindSelect2SearchUi() {
        $(document).off('select2:open.vmAdminSelect2').on('select2:open.vmAdminSelect2', function (e) {
            var $select = $(e.target);
            var placeholder = getSearchPlaceholderForSelect($select);
            window.setTimeout(function () {
                var $search = $('.select2-container--open .select2-search__field');
                if (!$search.length) {
                    return;
                }
                $search.attr('placeholder', placeholder);
                $search.trigger('focus');
            }, 0);
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
        wrapSelect2Plugin();
        if (!hasSelect2()) {
            return;
        }
        syncLegacyJqSelect2();
        bindSelect2SearchUi();
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

    $(document).on('shown.bs.modal shown.bs.tab', '.modal, [data-toggle="tab"], [data-bs-toggle="tab"]', function () {
        queueBoot(100);
    });

    $(document).on('click', 'ul#tabs li, .tab-contentt .tab-link a, .tab-contentt .tab-link', function () {
        queueBoot(120);
    });

})(window.jQuery);
