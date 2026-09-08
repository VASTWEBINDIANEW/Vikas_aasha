/**
 * VM Admin Select Search v1
 * Dedicated admin Select2 + search box for all dropdowns.
 * Uses window.vmAdminJq (footer jQuery with Select2 plugin).
 */
(function (window, document) {
    'use strict';

    var $ = window.vmAdminJq || window.jQuery;

    if (!$ || !$.fn || !$.fn.select2) {
        return;
    }

    var DEFAULT_PH = 'Search name, mobile, ID...';
    var INIT_SELECTOR = [
        'select.vm-admin-select-search',
        'select.for-select2',
        'select.vm-rl-select-search',
        'select.vm-csp-modal-select',
        'select.vm-opr-select',
        'select.vm-dmt-select',
        'select.vm-admin-select-search-target'
    ].join(', ');

    function getRoot(scope) {
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
        if (!$el || !$el.length) {
            return true;
        }
        if ($el.prop('disabled')) {
            return true;
        }
        if ($el.is('.vm-no-select2, [data-no-select2="true"], .profileseclet')) {
            return true;
        }
        if ($el.closest('.saas-prof-sec-control').length) {
            return true;
        }
        if ($el.attr('data-live-search') === 'false' || $el.attr('data_live_search') === 'false') {
            return true;
        }
        return false;
    }

    function destroyStale($el) {
        if ($el.next('.select2-container').length && !$el.hasClass('select2-hidden-accessible')) {
            $el.next('.select2-container').remove();
        }
        if ($el.hasClass('select2-hidden-accessible')) {
            try {
                $el.select2('destroy');
            } catch (ignore) { }
        }
        $el.removeClass('select2-hidden-accessible');
        $el.removeAttr('data-select2-id aria-hidden tabindex');
    }

    function patchInstance(inst) {
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

    function revealSearch($el) {
        var inst = $el.data('select2');
        var $dropdown;
        var $wrap;
        var $field;
        var ph;

        if (!inst) {
            return;
        }

        patchInstance(inst);

        $dropdown = inst.$dropdown && inst.$dropdown.length ? inst.$dropdown : $('.select2-dropdown.vm-admin-select-search-dropdown').last();
        if (!$dropdown.length) {
            $dropdown = $('.select2-dropdown.select2-dropdown--below, .select2-dropdown.select2-dropdown--above').last();
        }
        if (!$dropdown.length) {
            return;
        }

        $wrap = $dropdown.find('.select2-search--dropdown, .vm-admin-select-search-box').first();
        if (!$wrap.length) {
            $wrap = $(
                '<span class="select2-search select2-search--dropdown vm-admin-select-search-box vm-admin-select-search-box--visible">' +
                '<input type="search" class="select2-search__field vm-admin-select-search-input" ' +
                'autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" />' +
                '</span>'
            );
            $dropdown.prepend($wrap);
        }

        ph = getPlaceholder($el);

        $wrap.removeClass('select2-search--hide').addClass('vm-admin-select-search-box--visible');
        $field = $wrap.find('.select2-search__field, .vm-admin-select-search-input').first();

        $field.off('input.vmAdminSelectSearch keyup.vmAdminSelectSearch');
        $field.on('input.vmAdminSelectSearch keyup.vmAdminSelectSearch', function () {
            var term = $(this).val();
            patchInstance(inst);
            if (inst.dataAdapter && typeof inst.dataAdapter.query === 'function') {
                inst.dataAdapter.query({ term: term }, function (data) {
                    inst.trigger('results:all', {
                        results: data.results || data,
                        query: { term: term }
                    });
                });
            } else {
                inst.trigger('query', { term: term });
            }
        });

        $field.attr('placeholder', ph)
            .prop('readonly', false)
            .prop('disabled', false);

        $el.closest('.modal').addClass('vm-admin-select-search-open');

        window.setTimeout(function () {
            try {
                $field.trigger('focus');
            } catch (ignore) { }
        }, 0);
    }

    function bindSearchEvents($el) {
        $el.off('select2:open.vmAdminSelectSearch select2:close.vmAdminSelectSearch select2:opening.vmAdminSelectSearch');
        $el.on('select2:opening.vmAdminSelectSearch', function () {
            patchInstance($el.data('select2'));
        });
        $el.on('select2:open.vmAdminSelectSearch', function () {
            revealSearch($el);
            window.setTimeout(function () { revealSearch($el); }, 0);
            window.setTimeout(function () { revealSearch($el); }, 40);
            window.setTimeout(function () { revealSearch($el); }, 120);
        });
        $el.on('select2:close.vmAdminSelectSearch', function () {
            $el.closest('.modal').removeClass('vm-admin-select-search-open');
        });
    }

    function initOne($el, forceRebuild) {
        var placeholderText;
        var opts;

        if (isSkipped($el)) {
            return false;
        }

        $el.addClass('vm-admin-select-search');

        if (!forceRebuild && $el.hasClass('select2-hidden-accessible') && $el.next('.select2-container').length) {
            bindSearchEvents($el);
            patchInstance($el.data('select2'));
            return true;
        }

        destroyStale($el);

        placeholderText = $el.find('option[value=""]').first().text() ||
            $el.find('option:first').text() ||
            'Select';

        opts = {
            width: '100%',
            minimumResultsForSearch: 0,
            allowClear: true,
            placeholder: placeholderText,
            dropdownParent: $(document.body),
            dropdownCssClass: 'vm-admin-select-search-dropdown',
            containerCssClass: 'vm-admin-select-search-ui',
            language: {
                noResults: function () { return 'No match found'; },
                searching: function () { return 'Searching...'; },
                inputTooShort: function () { return 'Type to search...'; }
            }
        };

        $el.select2(opts);
        bindSearchEvents($el);
        patchInstance($el.data('select2'));

        return $el.hasClass('select2-hidden-accessible');
    }

    function tagModalSelects($root) {
        $root.find('.modal select.form-control, .saas-admin-modal select.form-control').each(function () {
            var $one = $(this);
            if (!isSkipped($one)) {
                $one.addClass('vm-admin-select-search vm-admin-select-search-target');
            }
        });
    }

    function boot(scope) {
        var $root;

        if (!$('body.saas-admin-ui').length) {
            return;
        }

        $root = getRoot(scope);
        tagModalSelects($root);

        $root.find(INIT_SELECTOR).each(function () {
            initOne($(this), !!$root.closest('.modal, .saas-admin-modal').length);
        });

        /* Modal selects not yet tagged */
        $root.find('select.form-control').each(function () {
            var $one = $(this);
            if (isSkipped($one)) {
                return;
            }
            if ($one.hasClass('select2-hidden-accessible')) {
                return;
            }
            if ($one.closest('.modal, .saas-admin-modal').length) {
                initOne($one, true);
            }
        });
    }

    window.VmAdminSelectSearch = {
        boot: boot,
        init: initOne,
        revealSearch: revealSearch
    };

    window.bootVmAdminSelectSearch = boot;

    $(function () {
        boot();
    });

    $(window).on('load', function () {
        window.setTimeout(boot, 150);
        window.setTimeout(boot, 600);
        window.setTimeout(boot, 1500);
    });

    $(document).on('shown.bs.modal show.bs.modal', '.modal', function () {
        var modal = this;
        window.setTimeout(function () { boot(modal); }, 50);
        window.setTimeout(function () { boot(modal); }, 250);
        window.setTimeout(function () { boot(modal); }, 600);
    });

    $(document).on('click', '[data-toggle="modal"][data-target], [data-bs-toggle="modal"][data-target]', function () {
        var target = $(this).attr('data-target') || $(this).attr('data-bs-target');
        if (!target) {
            return;
        }
        window.setTimeout(function () { boot(target); }, 300);
    });

    $(document).on('select2:open', 'select.vm-admin-select-search, select.for-select2, select.vm-csp-modal-select', function () {
        revealSearch($(this));
    });

})(window, document);
