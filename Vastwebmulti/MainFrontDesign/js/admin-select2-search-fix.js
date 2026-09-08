/**
 * ADMIN — Force Select2 search box on every searchable dropdown (v=1)
 * Loaded last so it wins over theme / modal / fund-transfer CSS & JS conflicts.
 */
(function ($) {
    'use strict';

    if (!$ || !$.fn || !$.fn.select2) {
        return;
    }

    var SEARCHABLE_SELECTOR = [
        'select.for-select2',
        'select.vm-rl-select-search',
        'select.vm-csp-modal-select',
        'select.vm-opr-select',
        'select.vm-dmt-select',
        'select.vm-admin-select-search'
    ].join(', ');

    var SKIP_SELECTOR = '.vm-no-select2, [data-no-select2="true"], .profileseclet';
    var DEFAULT_PH = 'Search name, mobile, ID...';

    function nativeSelect2() {
        if ($.fn.select2 && $.fn.select2.__vmAdminNative) {
            return $.fn.select2.__vmAdminNative;
        }
        return $.fn.select2;
    }

    function getPlaceholder($el) {
        return $el.attr('data-search-placeholder') ||
            $el.attr('data-placeholder') ||
            DEFAULT_PH;
    }

    function isSearchDisabled($el) {
        return $el.attr('data-live-search') === 'false' ||
            $el.attr('data_live_search') === 'false';
    }

    function patchShowSearch(inst) {
        if (!inst || !inst.dropdown) {
            return;
        }
        inst.dropdown.showSearch = function () {
            return true;
        };
        if (inst.options && typeof inst.options.set === 'function') {
            try {
                inst.options.set('minimumResultsForSearch', 0);
            } catch (ignore) { }
        }
    }

    function getOpenDropdown($select) {
        var inst = $select.data('select2');
        var $dropdown = $();

        if (inst && inst.$dropdown && inst.$dropdown.length) {
            $dropdown = inst.$dropdown;
        }

        if (!$dropdown.length) {
            $dropdown = $('.select2-dropdown.select2-dropdown--below, .select2-dropdown.select2-dropdown--above').last();
        }

        return { inst: inst, $dropdown: $dropdown };
    }

    function wireSearchInput($select, inst, $wrap) {
        var $field = $wrap.find('.select2-search__field');

        $field.off('input.vmSearchFix keyup.vmSearchFix');
        $field.on('input.vmSearchFix keyup.vmSearchFix', function () {
            var term = $(this).val();

            patchShowSearch(inst);

            if (inst && inst.dataAdapter && typeof inst.dataAdapter.query === 'function') {
                inst.dataAdapter.query({ term: term }, function (data) {
                    inst.trigger('results:all', {
                        results: data.results || data,
                        query: { term: term }
                    });
                });
            } else if (inst && typeof inst.trigger === 'function') {
                inst.trigger('query', { term: term });
            }
        });

        return $field;
    }

    window.revealAdminSelect2Search = function ($select, placeholder) {
        var ctx;
        var $wrap;
        var $field;
        var ph;

        if (!$select || !$select.length || isSearchDisabled($select)) {
            return;
        }

        ctx = getOpenDropdown($select);
        if (!ctx.inst || !ctx.$dropdown.length) {
            return;
        }

        patchShowSearch(ctx.inst);

        $wrap = ctx.$dropdown.find('.select2-search--dropdown').first();
        if (!$wrap.length) {
            $wrap = $(
                '<span class="select2-search select2-search--dropdown">' +
                '<input class="select2-search__field" type="search" tabindex="0" autocomplete="off" ' +
                'autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" />' +
                '</span>'
            );
            ctx.$dropdown.prepend($wrap);
        }

        ph = placeholder || getPlaceholder($select);

        $wrap.removeClass('select2-search--hide').css({
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            height: 'auto',
            minHeight: '52px',
            maxHeight: 'none',
            overflow: 'visible',
            pointerEvents: 'auto',
            padding: '10px'
        });

        $field = wireSearchInput($select, ctx.inst, $wrap);
        $field.attr('placeholder', ph)
            .prop('readonly', false)
            .prop('disabled', false)
            .css({
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                width: '100%',
                minHeight: '38px',
                pointerEvents: 'auto',
                cursor: 'text'
            });

        window.setTimeout(function () {
            try {
                $field.trigger('focus');
            } catch (ignore) { }
        }, 0);
    };

    function destroyBrokenSelect2($el) {
        if ($el.next('.select2-container').length && !$el.hasClass('select2-hidden-accessible')) {
            $el.next('.select2-container').remove();
        }
    }

    function initSearchableSelect($el) {
        var s2;
        var opts;

        if (!$el || !$el.length || $el.prop('disabled') || $el.is(SKIP_SELECTOR)) {
            return;
        }
        if (isSearchDisabled($el)) {
            return;
        }

        destroyBrokenSelect2($el);

        if (!$el.hasClass('select2-hidden-accessible')) {
            s2 = nativeSelect2();
            opts = {
                width: '100%',
                minimumResultsForSearch: 0,
                dropdownParent: $(document.body),
                dropdownCssClass: 'vm-admin-select2-dropdown vm-admin-select2-searchable vm-csp-select2-dropdown',
                language: {
                    noResults: function () { return 'No match found'; },
                    searching: function () { return 'Searching...'; }
                }
            };

            if ($el.find('option[value=""]').length || $el.find('option:first').text()) {
                opts.placeholder = $el.find('option[value=""]').first().text() ||
                    $el.find('option:first').text() ||
                    'Select';
                opts.allowClear = true;
            }

            s2.call($el, opts);
        }

        patchShowSearch($el.data('select2'));

        $el.off('select2:open.vmSearchFix select2:opening.vmSearchFix');
        $el.on('select2:opening.vmSearchFix', function () {
            patchShowSearch($el.data('select2'));
        });
        $el.on('select2:open.vmSearchFix', function () {
            var ph = getPlaceholder($el);
            window.revealAdminSelect2Search($el, ph);
            window.setTimeout(function () { window.revealAdminSelect2Search($el, ph); }, 0);
            window.setTimeout(function () { window.revealAdminSelect2Search($el, ph); }, 40);
            window.setTimeout(function () { window.revealAdminSelect2Search($el, ph); }, 120);
        });
    }

    function bootSearchableSelects($scope) {
        var $root = ($scope && $scope.length) ? $($scope) : $(document);

        if (!$('body.saas-admin-ui').length) {
            return;
        }

        $root.find(SEARCHABLE_SELECTOR).each(function () {
            initSearchableSelect($(this));
        });
    }

    window.bootAdminSelect2SearchFix = bootSearchableSelects;

    $(function () {
        bootSearchableSelects();
    });

    $(window).on('load', function () {
        window.setTimeout(bootSearchableSelects, 200);
        window.setTimeout(bootSearchableSelects, 800);
    });

    $(document).on('shown.bs.modal show.bs.modal', '.modal', function () {
        var $modal = $(this);
        window.setTimeout(function () {
            bootSearchableSelects($modal);
        }, 50);
        window.setTimeout(function () {
            bootSearchableSelects($modal);
        }, 300);
    });

    $(document).on('select2:open', 'select', function () {
        if ($('body.saas-admin-ui').length && !isSearchDisabled($(this))) {
            window.revealAdminSelect2Search($(this), getPlaceholder($(this)));
        }
    });

})(window.jQuery);
