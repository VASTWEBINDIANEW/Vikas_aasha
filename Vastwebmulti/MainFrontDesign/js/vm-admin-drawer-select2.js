/**
 * vm-admin-drawer-select2.js — Searchable Select2 inside admin drawers & modals
 */
(function (window, document) {
    'use strict';

    var RL_DRAWER = '#vmRlCreateModal';
    var RL_SELECTS = '#DealerID, #vmRlCreateState, #vmRlCreateDistrict';
    var RL_DETAIL_MODAL = '#defaultModal222';
    var RL_DETAIL_SELECTS = '#StateEdit, #DistrictEdit';
    var MODAL_ROOTS = '.vm-csp-modal, #myModal2, #myModal3, #defaultModal222';
    var MODAL_SELECTS = 'select.for-select2, select.vm-admin-select-search, select.vm-csp-modal-select, select.vm-rl-select-search, select.vm-ml-edit-select';

    function get$() {
        return window.vmAdminJq || window.jQuery;
    }

    function hasSelect2() {
        var $ = get$();
        return !!($ && $.fn && $.fn.select2);
    }

    function nativeSelect2() {
        var $ = get$();
        if ($ && $.fn && $.fn.select2 && $.fn.select2.__vmAdminNative) {
            return $.fn.select2.__vmAdminNative;
        }
        return $ && $.fn ? $.fn.select2 : null;
    }

    function isDetailKycSelect($el) {
        if (!$el || !$el.length) {
            return false;
        }
        var id = ($el.attr('id') || '').toLowerCase();
        return id === 'stateedit' || id === 'districtedit';
    }

    function getDropdownParent($el) {
        var $ = get$();
        var $drawer;
        var $modal;

        if (!$) {
            return null;
        }

        if (isDetailKycSelect($el)) {
            return $(document.body);
        }

        $drawer = $el.closest('.vm-rl-create-drawer');
        if ($drawer.length) {
            return $drawer.first();
        }

        $modal = $el.closest('.modal, .saas-admin-modal, [role="dialog"]');
        if ($modal.length) {
            return $modal.first();
        }

        if ($(RL_DRAWER).length) {
            return $(RL_DRAWER);
        }

        return $(document.body);
    }

    function getDropdownZIndex($el) {
        if (isDetailKycSelect($el)) {
            return 100120;
        }
        return 100020;
    }

    function patchSelect2Search($el) {
        var inst = $el.data('select2');
        if (!inst) {
            return;
        }
        if (inst.options && typeof inst.options.set === 'function') {
            try {
                inst.options.set('minimumResultsForSearch', 0);
            } catch (ignore) { }
        }
        if (inst.dropdown) {
            inst.dropdown.showSearch = function () {
                return true;
            };
        }
    }

    function destroySelect2($el) {
        if (!$el || !$el.length) {
            return;
        }
        try {
            if ($el.data('select2')) {
                var s2 = nativeSelect2();
                if (s2) {
                    s2.call($el, 'destroy');
                } else {
                    $el.select2('destroy');
                }
            }
        } catch (ignore) { }
        $el.removeClass('select2-hidden-accessible')
            .removeAttr('data-select2-id aria-hidden tabindex');
        $el.next('.select2-container').remove();
    }

    function getOptions($el) {
        var ph = $el.attr('data-search-placeholder') ||
            $el.attr('data_search_placeholder') ||
            'Search name, mobile, ID...';

        var dropdownCssClass = 'vm-select-dropdown vm-admin-select2-dropdown vm-admin-select2-searchable vm-rl-drawer-select2-dropdown';
        if (isDetailKycSelect($el)) {
            dropdownCssClass += ' vm-rl-detail-kyc-select2-dropdown';
        }

        return {
            width: '100%',
            minimumResultsForSearch: 0,
            allowClear: false,
            dropdownAutoWidth: false,
            dropdownParent: getDropdownParent($el),
            dropdownCssClass: dropdownCssClass,
            containerCssClass: 'vm-select-ui',
            language: {
                noResults: function () { return 'No match found'; },
                searching: function () { return 'Searching...'; },
                inputTooShort: function () { return 'Type to search...'; },
                searchPlaceholder: ph
            }
        };
    }

    function fixOpenDropdown($el) {
        var inst = $el.data('select2');
        var $dropdown;
        var ph;
        var tries = 0;

        ph = $el.attr('data-search-placeholder') ||
            $el.attr('data_search_placeholder') ||
            'Search name, mobile, ID...';

        function apply() {
            tries += 1;
            patchSelect2Search($el);

            if (inst && inst.$dropdown && inst.$dropdown.length) {
                $dropdown = inst.$dropdown;
            } else {
                $dropdown = getDropdownParent($el).find('> .select2-dropdown').last();
                if (!$dropdown.length) {
                    $dropdown = $('body > .select2-dropdown').last();
                }
            }

            if ($dropdown && $dropdown.length) {
                $dropdown.addClass('vm-rl-drawer-select2-dropdown vm-select-dropdown vm-admin-select2-searchable');
                if (isDetailKycSelect($el)) {
                    $dropdown.addClass('vm-rl-detail-kyc-select2-dropdown');
                }
                $dropdown.css({
                    zIndex: getDropdownZIndex($el),
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1,
                    pointerEvents: 'auto'
                });
            }

            if (typeof window.forceAdminSelect2SearchAlways === 'function') {
                window.forceAdminSelect2SearchAlways($el);
            }
            if (window.VmSelect && typeof window.VmSelect.showSearch === 'function') {
                window.VmSelect.showSearch($el);
            }

            if ($dropdown && $dropdown.length) {
                $dropdown.find('.select2-search--dropdown').removeClass('select2-search--hide').show();
                $dropdown.find('.select2-search__field').attr('placeholder', ph).prop('readonly', false).prop('disabled', false);
                if (tries === 1) {
                    try {
                        $dropdown.find('.select2-search__field').trigger('focus');
                    } catch (ignoreFocus) { }
                }
            }

            if (tries < 10) {
                window.setTimeout(apply, 35);
            }
        }

        apply();
    }

    function bindSearchOpen($el) {
        $el.off('select2:open.vmAdminDrawerS2 select2:opening.vmAdminDrawerS2')
            .on('select2:opening.vmAdminDrawerS2', function () {
                patchSelect2Search($el);
            })
            .on('select2:open.vmAdminDrawerS2', function () {
                fixOpenDropdown($el);
            });
    }

    function initSelectEl(el) {
        var $ = get$();
        var $el;
        var opts;
        var s2;

        if (!hasSelect2() || !el) {
            return false;
        }

        $el = $(el);
        if (!$el.length || !$el.is('select') || $el.prop('disabled')) {
            return false;
        }

        destroySelect2($el);
        opts = getOptions($el);
        s2 = nativeSelect2();

        if (!s2) {
            return false;
        }

        try {
            s2.call($el, opts);
        } catch (ignoreNative) {
            try {
                s2.call($el, {
                    width: '100%',
                    minimumResultsForSearch: 0,
                    dropdownParent: getDropdownParent($el)
                });
            } catch (ignorePlain) {
                return false;
            }
        }

        if (!$el.hasClass('select2-hidden-accessible') || !$el.next('.select2-container').length) {
            return false;
        }

        patchSelect2Search($el);
        bindSearchOpen($el);

        if (typeof window.bindAdminSelect2SearchBehavior === 'function') {
            window.bindAdminSelect2SearchBehavior($el);
        }

        return true;
    }

    function bootRetailerDrawer() {
        var $ = get$();
        if (!$) {
            return;
        }
        $(RL_SELECTS).each(function () {
            initSelectEl(this);
        });
    }

    function bootRetailerDetailKycSelects() {
        var $ = get$();
        var $targets;
        var extraOptions;

        if (!$) {
            return false;
        }

        $targets = $(RL_DETAIL_SELECTS);
        if (!$targets.length) {
            return false;
        }

        extraOptions = {
            width: '100%',
            dropdownParent: $(document.body),
            minimumResultsForSearch: 0,
            dropdownCssClass: 'vm-select-dropdown vm-admin-select2-dropdown vm-admin-select2-searchable vm-rl-detail-kyc-select2-dropdown'
        };

        if (typeof window.forceAdminSelect2 === 'function') {
            window.forceAdminSelect2($targets, extraOptions, true);
        } else {
            $targets.each(function () {
                initSelectEl(this);
            });
        }

        if (typeof window.syncOpenSelect2ZIndex === 'function') {
            window.syncOpenSelect2ZIndex();
        }

        return true;
    }

    function bootModal(root) {
        var $ = get$();
        var $root;
        if (!$) {
            return;
        }
        $root = root ? $(root) : $(MODAL_ROOTS);
        $root.find(MODAL_SELECTS).each(function () {
            initSelectEl(this);
        });
    }

    function bindRetailerStateDistrict() {
        var $ = get$();
        if (!$ || typeof window.bindAdminStateDistrict !== 'function') {
            return;
        }
        if ($('#vmRlCreateState').attr('data-vm-admin-district-bound') === 'true') {
            return;
        }

        window.bindAdminStateDistrict('#vmRlCreateState', '#vmRlCreateDistrict', window.vmRlDistrictUrl, {
            placeholder: 'Select District',
            onError: function (xhr) {
                alert('Unable to load districts. ' + (xhr.status || '') + ' ' + (xhr.statusText || ''));
            }
        });

        $(document).off('change.vmAdminDrawerDistrict select2:select.vmAdminDrawerDistrict', '#vmRlCreateState')
            .on('change.vmAdminDrawerDistrict select2:select.vmAdminDrawerDistrict', '#vmRlCreateState', function () {
                window.setTimeout(function () {
                    initSelectEl(document.getElementById('vmRlCreateDistrict'));
                }, 400);
            });
    }

    function onRetailerDrawerOpen() {
        bootRetailerDrawer();
        bindRetailerStateDistrict();
        window.setTimeout(bootRetailerDrawer, 100);
        window.setTimeout(bootRetailerDrawer, 350);
    }

    window.vmAdminDrawerSelect2Init = initSelectEl;
    window.vmRlInitSelect2OnEl = initSelectEl;
    window.vmRlBootDrawerSelects = function () {
        onRetailerDrawerOpen();
        return true;
    };
    window.vmRlInitDrawerSelects = onRetailerDrawerOpen;
    window.vmRlInitDetailKycSelects = function () {
        bootRetailerDetailKycSelects();
        window.setTimeout(bootRetailerDetailKycSelects, 80);
        window.setTimeout(bootRetailerDetailKycSelects, 260);
        return true;
    };

    window.vmRlInitDetailKycDistrictSelect = function () {
        var $ = get$();
        var extraOptions;

        if (!$ || !$('#DistrictEdit').length) {
            return false;
        }

        extraOptions = {
            width: '100%',
            dropdownParent: $(document.body),
            minimumResultsForSearch: 0,
            dropdownCssClass: 'vm-select-dropdown vm-admin-select2-dropdown vm-admin-select2-searchable vm-rl-detail-kyc-select2-dropdown'
        };

        if (typeof window.forceAdminSelect2 === 'function') {
            window.forceAdminSelect2($('#DistrictEdit'), extraOptions, true);
        } else {
            initSelectEl(document.getElementById('DistrictEdit'));
        }

        if (typeof window.syncOpenSelect2ZIndex === 'function') {
            window.syncOpenSelect2ZIndex();
        }

        return true;
    };
    window.vmBootAdminDrawerSelect2 = function (scope) {
        var $ = get$();
        if (!scope || scope === RL_DRAWER || scope === '.vm-rl-create-drawer') {
            onRetailerDrawerOpen();
            return;
        }
        if ($ && ($(scope).is(RL_DRAWER) || $(scope).hasClass('vm-rl-create-drawer'))) {
            onRetailerDrawerOpen();
            return;
        }
        bootModal(scope);
    };

    function watchRetailerDrawer() {
        var drawer = document.querySelector(RL_DRAWER);
        if (!drawer || !window.MutationObserver) {
            return;
        }
        new MutationObserver(function () {
            if (drawer.classList.contains('is-open')) {
                onRetailerDrawerOpen();
            }
        }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }

    function start() {
        var $ = get$();
        if (!hasSelect2()) {
            window.setTimeout(start, 80);
            return;
        }

        $(document).off('select2:open.vmAdminDrawerS2Global', RL_SELECTS + ', ' + RL_DETAIL_SELECTS)
            .on('select2:open.vmAdminDrawerS2Global', RL_SELECTS + ', ' + RL_DETAIL_SELECTS, function () {
                fixOpenDropdown($(this));
            });

        $(document).off('click.vmAdminDrawerS2', '#btnOpenCreateRetailer')
            .on('click.vmAdminDrawerS2', '#btnOpenCreateRetailer', function () {
                window.setTimeout(onRetailerDrawerOpen, 50);
                window.setTimeout(onRetailerDrawerOpen, 300);
            });

        $(document).off('shown.bs.modal.vmAdminDrawerS2 show.bs.modal.vmAdminDrawerS2', MODAL_ROOTS)
            .on('shown.bs.modal.vmAdminDrawerS2 show.bs.modal.vmAdminDrawerS2', MODAL_ROOTS, function () {
                var modal = this;
                window.setTimeout(function () { bootModal(modal); }, 40);
                window.setTimeout(function () { bootModal(modal); }, 220);
            });

        watchRetailerDrawer();
    }

    if (get$()) {
        get$()(function () {
            start();
        });
    } else {
        window.setTimeout(start, 150);
    }
})(window, document);
