/**
 * vm.js — Admin Select2 + search box (all admin pages)
 * Load LAST in layout. Uses footer jQuery + Select2 (vmAdminJq).
 */
(function (window, document) {
    'use strict';

    var DEFAULT_PH = 'Search name, mobile, ID...';
    var MARK = 'vm-select-init';
    var DROPDOWN_CLASS = 'vm-select-dropdown';
    var CONTAINER_CLASS = 'vm-select-ui';

    function get$() {
        return window.vmAdminJq || window.jQuery;
    }

    function hasPlugin() {
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

    function getRoot(scope) {
        var $ = get$();
        if (!scope) {
            return $(document);
        }
        if (scope.nodeType === 1) {
            return $(scope);
        }
        return $(scope);
    }

    function getPlaceholder($el) {
        return $el.attr('data-search-placeholder') ||
            $el.attr('data-placeholder') ||
            DEFAULT_PH;
    }

    function isSkipped($el) {
        if (!$el || !$el.length || $el.prop('disabled')) {
            return true;
        }
        if ($el.is('.vm-no-select2, [data-no-select2="true"], .profileseclet, select[multiple]')) {
            return true;
        }
        if ($el.closest('.saas-prof-sec-control').length) {
            return true;
        }
        if ($el.closest('[data-admin-select2-custom="true"]').length) {
            if ($el.closest('.vm-rl-create-drawer, .vm-csp-modal, .modal').length) {
                return false;
            }
            return true;
        }
        if ($el.attr('data-live-search') === 'false' || $el.attr('data_live_search') === 'false') {
            return true;
        }
        if ($el.closest('.saas-operator-report-page').length && $('#operatorReportForm').length) {
            var $filterWrap = $el.closest('.vm-opr-filter-extra');
            if ($filterWrap.length && ($filterWrap.is(':hidden') || $filterWrap.css('display') === 'none')) {
                return true;
            }
        }
        return false;
    }

    function shouldSearch($el) {
        if ($el.find('option').length <= 1) {
            return false;
        }
        return true;
    }

    function destroySelect2($el) {
        var s2 = nativeSelect2();
        if (!s2 || !$el || !$el.length) {
            return;
        }
        if ($el.next('.select2-container').length && !$el.hasClass('select2-hidden-accessible')) {
            $el.next('.select2-container').remove();
        }
        if ($el.hasClass('select2-hidden-accessible')) {
            try {
                s2.call($el, 'destroy');
            } catch (ignore) { }
        }
        $el.removeClass('select2-hidden-accessible ' + MARK);
        $el.removeAttr('data-select2-id aria-hidden tabindex');
    }

    function patchInst(inst) {
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

    function showSearch($el) {
        var $ = get$();
        var inst = $el.data('select2');
        var $dropdown;
        var $wrap;
        var $field;
        var ph;

        if (!inst) {
            return;
        }

        patchInst(inst);

        if (typeof window.forceAdminSelect2SearchAlways === 'function') {
            window.forceAdminSelect2SearchAlways($el);
        }

        $dropdown = (inst.$dropdown && inst.$dropdown.length) ? inst.$dropdown : $('.' + DROPDOWN_CLASS).last();
        if (!$dropdown.length) {
            $dropdown = $('.select2-dropdown.select2-dropdown--below, .select2-dropdown.select2-dropdown--above').last();
        }
        if (!$dropdown.length) {
            return;
        }

        $wrap = $dropdown.find('.select2-search--dropdown, .vm-select-search-wrap').first();
        if (!$wrap.length) {
            $wrap = $(
                '<span class="select2-search select2-search--dropdown vm-select-search-wrap">' +
                '<input type="search" class="select2-search__field vm-select-search-input" autocomplete="off" spellcheck="false" />' +
                '</span>'
            );
            $dropdown.prepend($wrap);
        }

        ph = getPlaceholder($el);
        $wrap.removeClass('select2-search--hide').show();
        $field = $wrap.find('.select2-search__field, .vm-select-search-input').first();

        /* Select2 filters options itself — do not call dataAdapter.query manually */
        $field.off('.vmSelectSearch');

        $field.attr('placeholder', ph).prop('readonly', false).prop('disabled', false);
        $el.closest('.modal, .vm-rl-create-drawer').addClass('vm-select-open');

        window.setTimeout(function () {
            try {
                $field.trigger('focus');
            } catch (ignore) { }
        }, 0);
    }

    function bindOpen($el) {
        $el.off('.vmSelect');
        $el.on('select2:opening.vmSelect', function () {
            patchInst($el.data('select2'));
        });
        $el.on('select2:open.vmSelect', function () {
            showSearch($el);
            window.setTimeout(function () { showSearch($el); }, 0);
            window.setTimeout(function () { showSearch($el); }, 50);
            window.setTimeout(function () { showSearch($el); }, 150);
        });
        $el.on('select2:close.vmSelect', function () {
            $el.closest('.modal').removeClass('vm-select-open');
        });
    }

    function initSelect($el, force) {
        var $ = get$();
        var s2 = nativeSelect2();
        var opts;
        var phText;

        if (!hasPlugin() || !$el || !$el.length || isSkipped($el) || !shouldSearch($el)) {
            return false;
        }

        $el.addClass(MARK + ' vm-admin-select-search for-select2');

        if (!force && $el.hasClass('select2-hidden-accessible') && $el.next('.select2-container').length) {
            bindOpen($el);
            patchInst($el.data('select2'));
            return true;
        }

        destroySelect2($el);

        phText = $el.find('option[value=""]').first().text() ||
            $el.attr('data-placeholder') ||
            'Select';

        opts = {
            width: '100%',
            minimumResultsForSearch: 0,
            allowClear: false,
            placeholder: {
                id: '',
                text: phText
            },
            dropdownParent: $(document.body),
            dropdownCssClass: DROPDOWN_CLASS + ' vm-admin-select2-searchable',
            containerCssClass: CONTAINER_CLASS
        };

        try {
            s2.call($el, opts);
        } catch (errInit) {
            try {
                s2.call($el, {
                    width: '100%',
                    minimumResultsForSearch: 0,
                    allowClear: false,
                    dropdownParent: $(document.body),
                    dropdownCssClass: DROPDOWN_CLASS,
                    containerCssClass: CONTAINER_CLASS
                });
            } catch (ignore) { }
        }
        bindOpen($el);
        patchInst($el.data('select2'));

        return $el.hasClass('select2-hidden-accessible');
    }

    function collectSelects($root) {
        var $ = get$();
        var list = [];
        var seen = {};
        var isDoc = !$root.length || $root[0] === document || $root[0] === document.documentElement;

        function addEl(el) {
            var id = el.id || el.name || ('idx-' + list.length);
            if (seen[id]) {
                return;
            }
            seen[id] = true;
            list.push(el);
        }

        $root.find([
            'select.vm-admin-select-search',
            'select.for-select2',
            'select.vm-rl-select-search',
            'select.vm-csp-modal-select',
            'select.vm-opr-select',
            'select.vm-dmt-select',
            'select#RetailerList',
            'select#DistributorDDL'
        ].join(', ')).each(function () {
            addEl(this);
        });

        if (isDoc) {
            $('body.saas-admin-ui select.form-control').each(function () {
                var $one = $(this);
                if (isSkipped($one) || !shouldSearch($one)) {
                    return;
                }
                if ($one.find('option').length > 3 || $one.closest('.modal').length) {
                    addEl(this);
                }
            });
        } else {
            $root.find('select.form-control').each(function () {
                var $one = $(this);
                if (isSkipped($one) || !shouldSearch($one)) {
                    return;
                }
                addEl(this);
            });
        }

        return list;
    }

    function boot(scope) {
        var $ = get$();
        var $root;
        var nodes;
        var i;

        if (!hasPlugin() || !$('body.saas-admin-ui').length) {
            return;
        }

        $root = getRoot(scope);
        nodes = collectSelects($root);

        for (i = 0; i < nodes.length; i++) {
            initSelect($(nodes[i]), true);
        }

        initSelect($('#RetailerList'), true);
        initSelect($('#DistributorDDL'), true);
    }

    window.VmSelect = {
        boot: boot,
        init: initSelect,
        showSearch: showSearch
    };
    window.bootVmAdminSelectSearch = boot;
    window.VmAdminSelectSearch = window.VmSelect;

    function start() {
        var $ = get$();
        if (!hasPlugin()) {
            window.setTimeout(start, 120);
            return;
        }

        boot();

        $(document).off('mousedown.vmSelectNative', 'body.saas-admin-ui select.form-control');
        $(document).on('mousedown.vmSelectNative', 'body.saas-admin-ui select.form-control', function (e) {
            var $el = $(this);
            if (isSkipped($el) || !shouldSearch($el)) {
                return;
            }
            if ($el.hasClass('select2-hidden-accessible')) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            initSelect($el, true);
            window.setTimeout(function () {
                var fn = nativeSelect2();
                if (!fn) {
                    return;
                }
                try {
                    fn.call($el, 'open');
                } catch (ignore) { }
            }, 20);
        });

        $(document).off('select2:open.vmSelectGlobal');
        $(document).on('select2:open.vmSelectGlobal', 'body.saas-admin-ui select', function () {
            showSearch($(this));
        });

        $(document).off('shown.bs.modal.vmSelect show.bs.modal.vmSelect', '.modal');
        $(document).on('shown.bs.modal.vmSelect show.bs.modal.vmSelect', '.modal', function () {
            var el = this;
            window.setTimeout(function () { boot(el); }, 30);
            window.setTimeout(function () { boot(el); }, 200);
            window.setTimeout(function () { boot(el); }, 500);
        });

        $(document).off('click.vmSelectModal', '[data-toggle="modal"][data-target], [data-target="#myModal2"], [data-target="#myModal3"]');
        $(document).on('click.vmSelectModal', '[data-toggle="modal"][data-target], [data-target="#myModal2"], [data-target="#myModal3"]', function () {
            var t = $(this).attr('data-target');
            if (t) {
                window.setTimeout(function () { boot(t); }, 350);
            }
        });

        $(document).off('click.vmSelectRlDrawer', '#btnOpenCreateRetailer');
        $(document).on('click.vmSelectRlDrawer', '#btnOpenCreateRetailer', function () {
            window.setTimeout(function () { boot('.vm-rl-create-drawer'); }, 50);
            window.setTimeout(function () { boot('.vm-rl-create-drawer'); }, 280);
            window.setTimeout(function () { boot('.vm-rl-create-drawer'); }, 600);
        });

        (function watchRlDrawer() {
            var drawer = document.getElementById('vmRlCreateModal');
            if (!drawer || !window.MutationObserver) {
                return;
            }
            new MutationObserver(function () {
                if (drawer.classList.contains('is-open')) {
                    boot('.vm-rl-create-drawer');
                    window.setTimeout(function () { boot('.vm-rl-create-drawer'); }, 200);
                }
            }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
        })();
    }

    if (get$()) {
        get$()(function () {
            start();
        });
        get$()(window).on('load', function () {
            window.setTimeout(function () { boot(); }, 100);
            window.setTimeout(function () { boot(); }, 500);
            window.setTimeout(function () { boot('#myModal2'); boot('#myModal3'); }, 1000);
        });
    } else {
        window.setTimeout(start, 200);
    }

})(window, document);
