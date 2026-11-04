/**
 * Operator Info tabs — purane project jaisa Bootstrap 3 data-toggle="tab".
 * Saari tables server-rendered; switching = show/hide .tab-pane.active (no AJAX).
 */
(function ($) {
    'use strict';
    if (!$ || !$.fn || !$.fn.tab) {
        return;
    }

    function page() {
        return $('section.vm-operator-info-page');
    }

    function tabStrip() {
        return page().find('#vmOiTabList').first();
    }

    function tabContent() {
        return page().find('.tab-contentoperators').first();
    }

    function activePane() {
        var p = tabContent().children('.tab-pane.active');
        return p.length ? p : tabContent().children('.tab-pane').first();
    }

    function syncHeader(name) {
        if (name && $.trim(name) !== '') {
            page().find('.textshowspanclass-header').first().text($.trim(name));
        }
    }

    function tabLink(href) {
        if (!href || href.charAt(0) !== '#') {
            return $();
        }
        return tabStrip().find('a[data-toggle="tab"][href="' + href + '"]').first();
    }

    var vmOiScrollPaneIds = ['prepaidoperators', 'utilitisoperators', 'moneyoperator', 'Walletoperator', 'aepsoperator', 'Microatmcashoperator', 'mposoperator', 'Microatmpurchaseoperator', 'giftcardoperator', 'insuranceoperator'];
    var vmOiFullWidthPaneIds = ['prepaidoperators', 'utilitisoperators', 'pancardoperator', 'Microatmpurchaseoperator'];
    var vmOiWideGridPaneIds = ['aepsoperator', 'Microatmcashoperator'];

    function vmIsWideGridTable($table) {
        return $table && $table.length && ($table.hasClass('vm-oi-grid-table') || $table.closest('#aepsoperator, #Microatmcashoperator').length > 0);
    }

    function vmClearPaneInlineDisplay() {
        tabContent().children('.tab-pane').each(function () {
            this.style.removeProperty('display');
            this.style.removeProperty('visibility');
            this.style.removeProperty('height');
            this.style.removeProperty('overflow');
        });
    }

    function vmClearWideGridTableInline($table) {
        if (!$table || !$table.length || !$table[0]) {
            return;
        }
        var el = $table[0];
        el.style.removeProperty('width');
        el.style.removeProperty('min-width');
        el.style.removeProperty('max-width');
        el.style.removeProperty('table-layout');
    }

    function vmIsCompactViewport() {
        var w = window.innerWidth || document.documentElement.clientWidth || 0;
        if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) {
            return true;
        }
        return w > 0 && w <= 1024;
    }

    /** Flex basis that accounts for gap (25% + gap overflows the row). */
    function vmOiTabColBasis() {
        var w = window.innerWidth || document.documentElement.clientWidth || 1025;
        var gap = 6;
        var cols = w <= 560 ? 2 : 4;
        var gapTotal = gap * (cols - 1);
        return 'calc((100% - ' + gapTotal + 'px) / ' + cols + ')';
    }

    function vmTableScrollHost($el) {
        if (!$el || !$el.length) {
            return $el;
        }
        var $shell = $el.closest('.vm-oi-table-scroll-shell');
        return $shell.length ? $shell : $el;
    }

    function vmEnsureScrollShells() {
        var $ul = tabStrip();
        if ($ul.length && !$ul.parent().hasClass('vm-oi-tab-scroll-shell')) {
            $ul.wrap('<div class="vm-oi-tab-scroll-shell"></div>');
        }
        var $tc = tabContent();
        if ($tc.length && !$tc.parent().hasClass('vm-oi-table-area-shell')) {
            $tc.wrap('<div class="vm-oi-table-area-shell"></div>');
        }
        tabContent().children('.tab-pane').each(function () {
            $(this).children('.col-md-12').each(function () {
                var $col = $(this);
                if (!$col.find('table.vm-oi-data-table, table.table').length) {
                    return;
                }
                if ($col.parent().hasClass('vm-oi-table-scroll-shell')) {
                    return;
                }
                $col.wrap('<div class="vm-oi-table-scroll-shell"></div>');
            });
        });
    }

    function vmApplyCompactTableScrollLayout() {
        page().find('.vm-oi-table-scroll-shell, .tab-contentoperators .vm-oi-table-scroll-wrap').each(function () {
            var $box = $(this);
            $box.addClass('vm-oi-table-scroll-wrap');
            this.style.setProperty('overflow-x', 'auto', 'important');
            this.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
            this.style.setProperty('max-width', '100%', 'important');
            this.style.setProperty('width', '100%', 'important');
        });
        page().find('.tab-contentoperators .tab-pane .col-md-12').each(function () {
            var $box = $(this);
            if (!$box.find('table.vm-oi-data-table, table.table').length) {
                return;
            }
            if ($box.parent().hasClass('vm-oi-table-scroll-shell')) {
                return;
            }
            $box.addClass('vm-oi-table-scroll-wrap');
            this.style.setProperty('overflow-x', 'auto', 'important');
            this.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
            this.style.setProperty('max-width', '100%', 'important');
            this.style.setProperty('width', '100%', 'important');
        });
        page().find('.tab-contentoperators table.vm-oi-data-table').each(function () {
            var $t = $(this);
            if (vmIsWideGridTable($t)) {
                vmClearWideGridTableInline($t);
                return;
            }
            if ($t.closest('#pancardoperator').length) {
                return;
            }
            vmClearWideGridTableInline($t);
            this.style.setProperty('width', 'max-content', 'important');
            this.style.setProperty('min-width', '880px', 'important');
            this.style.setProperty('max-width', 'none', 'important');
            this.style.setProperty('table-layout', 'auto', 'important');
        });
    }

    function vmForceFullWidthTables() {
        if (vmIsCompactViewport()) {
            vmApplyCompactTableScrollLayout();
            return;
        }
        page().find('.tab-contentoperators table.vm-oi-data-table.vm-oi-table-full').each(function () {
            var $t = $(this);
            if (vmIsWideGridTable($t)) {
                vmClearWideGridTableInline($t);
                return;
            }
            this.style.setProperty('width', '100%', 'important');
            this.style.setProperty('min-width', '100%', 'important');
            this.style.setProperty('max-width', '100%', 'important');
            this.style.setProperty('table-layout', 'fixed', 'important');
        });
        $.each(vmOiFullWidthPaneIds, function (_, id) {
            var $p = tabContent().children('.tab-pane#' + id);
            if (!$p.length) {
                return;
            }
            $p.css({ width: '100%', maxWidth: '100%' });
            $p.children('.col-md-12').css({ width: '100%', maxWidth: '100%', minWidth: 0 });
        });
        $.each(vmOiWideGridPaneIds, function (_, id) {
            var $p = tabContent().children('.tab-pane#' + id);
            if (!$p.length) {
                return;
            }
            $p.css({ width: '100%', maxWidth: '100%', overflowX: 'hidden' });
            $p.children('.col-md-12.vm-oi-hscroll').css({ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto' });
            vmClearWideGridTableInline($p.find('table.vm-oi-grid-table').first());
        });
    }

    function vmSyncScrollBox(box) {
        if (!box || !box.length || !box[0]) {
            return;
        }
        var max = box[0].scrollWidth - box[0].clientWidth;
        var x = box.scrollLeft();
        box.toggleClass('vm-oi-noscroll', max <= 4);
        box.toggleClass('vm-oi-at-start', x <= 4);
        box.toggleClass('vm-oi-at-end', x >= max - 4);
    }

    function vmSyncScrollBoxes($root) {
        var $scope = ($root && $root.length) ? $root : page();
        $scope.find('.tab-contentoperators .tab-pane.active .vm-oi-table-scroll-shell, .tab-contentoperators .tab-pane.active .col-md-12').each(function () {
            var box = vmTableScrollHost($(this));
            if (box.find('table.table').length) {
                vmSyncScrollBox(box);
            }
        });
    }

    function vmAdjustPaneLayout($pane) {
        tabContent().children('.tab-pane').each(function () {
            var $p = $(this);
            var id = $p.attr('id') || '';
            var scroll = vmOiScrollPaneIds.indexOf(id) >= 0;
            $p.toggleClass('vm-oi-pane-scroll', scroll).toggleClass('vm-oi-pane-compact', !scroll);
        });
        if (!vmIsCompactViewport()) {
            page().find('.tab-pane.vm-oi-pane-compact table.vm-oi-data-table:not(.vm-oi-grid-table)').each(function () {
                this.style.setProperty('width', '100%', 'important');
                this.style.setProperty('min-width', '100%', 'important');
                this.style.setProperty('max-width', '100%', 'important');
            });
        }
        vmForceFullWidthTables();
        if ($pane && $pane.length) {
            vmSyncScrollBoxes($pane);
        }
    }

    function vmNormalizeOpInfoTabStrip() {
        var $ul = tabStrip();
        if (!$ul.length) {
            return;
        }
        $ul.closest('center').css({ display: 'block', visibility: 'visible' });
        var compactTabs = vmIsCompactViewport();
        if (compactTabs) {
            var w = window.innerWidth || document.documentElement.clientWidth || 1024;
            var gridCols = w <= 560 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))';
            $ul.addClass('vm-oi-tab-grid');
            $ul[0].style.setProperty('display', 'grid', 'important');
            $ul[0].style.setProperty('grid-template-columns', gridCols, 'important');
            $ul[0].style.setProperty('grid-auto-flow', 'row', 'important');
            $ul[0].style.setProperty('width', '100%', 'important');
            $ul[0].style.setProperty('max-width', '100%', 'important');
            $ul[0].style.setProperty('box-sizing', 'border-box', 'important');
            $ul[0].style.removeProperty('flex-direction');
            $ul[0].style.removeProperty('flex-wrap');
            $ul.css({ visibility: 'visible', overflowX: 'hidden', overflowY: 'visible', gap: '6px' });
            $ul.children('li').each(function () {
                this.style.removeProperty('flex');
                this.style.setProperty('width', '100%', 'important');
                this.style.setProperty('max-width', '100%', 'important');
                this.style.setProperty('min-width', '0', 'important');
                this.style.setProperty('margin', '0', 'important');
                this.style.setProperty('float', 'none', 'important');
                this.style.setProperty('clear', 'none', 'important');
            });
        } else {
            $ul[0].style.removeProperty('display');
            $ul[0].style.removeProperty('grid-template-columns');
            $ul[0].style.removeProperty('grid-auto-flow');
            $ul[0].style.setProperty('display', 'flex', 'important');
            $ul.css({ visibility: 'visible', width: '100%', maxWidth: '100%', overflowX: 'hidden', overflowY: 'hidden', flexWrap: 'nowrap', gridTemplateColumns: 'none' });
            $ul.children('li').each(function () {
                this.style.setProperty('flex', '1 1 0', 'important');
                this.style.setProperty('min-width', '0', 'important');
                this.style.setProperty('max-width', 'none', 'important');
                this.style.setProperty('margin', '0', 'important');
            });
        }
        $ul.find('> li > a').each(function () {
            this.style.setProperty('height', '66px', 'important');
            this.style.setProperty('min-height', '66px', 'important');
            this.style.setProperty('max-height', '66px', 'important');
            this.style.setProperty('width', '100%', 'important');
            this.style.setProperty('transform', 'none', 'important');
            this.style.setProperty('box-shadow', 'none', 'important');
            this.style.setProperty('margin', '0', 'important');
        });
    }

    function onTabShown($a) {
        var $link = ($a && $a.length) ? $a : tabStrip().find('> li.active > a[data-toggle="tab"]').first();
        var href = $link.attr('href') || '';
        var label = ($link.find('span').first().text() || $link.text() || '').trim();
        syncHeader(label);
        var $pane = href ? tabContent().children('.tab-pane' + href) : activePane();
        vmEnsureScrollShells();
        vmAdjustPaneLayout($pane);
        vmNormalizeOpInfoTabStrip();
        if (vmIsCompactViewport()) {
            vmApplyCompactTableScrollLayout();
        }
        setTimeout(function () {
            vmEnsureScrollShells();
            vmNormalizeOpInfoTabStrip();
            vmSyncScrollBoxes($pane);
        }, 50);
        setTimeout(function () {
            vmNormalizeOpInfoTabStrip();
        }, 200);
    }

    function vmOpInfoShowTab(href, updateHash) {
        var $a = tabLink(href);
        if (!$a.length) {
            return null;
        }
        $a.tab('show');
        if (updateHash !== false && href) {
            try {
                var base = window.location.pathname + window.location.search;
                history.replaceState(null, '', base + href);
            } catch (err) { }
        }
        return tabContent().children('.tab-pane' + href);
    }

    function bindVmOiTabs() {
        var $strip = tabStrip();
        $strip.off('shown.bs.tab.vmOi click.vmOiTab');
        $strip.on('shown.bs.tab.vmOi', 'a[data-toggle="tab"]', function (e) {
            onTabShown($(e.target).closest('a[data-toggle="tab"]'));
            var href = $(e.target).closest('a[data-toggle="tab"]').attr('href') || '';
            if (href) {
                try {
                    var base = window.location.pathname + window.location.search;
                    history.replaceState(null, '', base + href);
                } catch (err2) { }
            }
        });
        /* Breadcrumb — purane project jaisa li click */
        page().find('.giftcardcategory').off('click.vmOiTab', '#vmOiTabList li');
        page().find('.giftcardcategory').on('click.vmOiTab', '#vmOiTabList li', function () {
            var text = $(this).text();
            if ($.trim(text) !== '') {
                syncHeader($.trim(text));
            }
        });
    }

    function fillEmptyTimes() {
        page().find('.tab-contentoperators table.table tbody tr').each(function () {
            $(this).find('td').each(function () {
                var cell = $(this);
                if (cell.find('span,p,button').length === 0 && $.trim(cell.text()) === '') {
                    cell.addClass('oi-empty-time').text('\u2014');
                }
            });
        });
    }

    function vmPolishUnitsCodes() {
        var $pg = page();
        $pg.find('.tab-contentoperators table.table tbody td').each(function () {
            var cell = $(this);
            if (cell.find('span,p,button').length > 0) {
                return;
            }
            var txt = $.trim(cell.text());
            if (txt === '') {
                return;
            }
            var html = cell.html();
            if (!html) {
                return;
            }
            if (html.indexOf('vm-oi-unit') === -1 && (txt.indexOf('(%)') !== -1 || txt.indexOf('(Rs.)') !== -1)) {
                cell.html(html.split('(%)').join('<span class="vm-oi-unit">(%)</span>').split('(Rs.)').join('<span class="vm-oi-unit">(Rs.)</span>'));
            }
        });
        $pg.find('#prepaidoperators table.table tbody tr td:nth-child(3), #utilitisoperators table.table tbody td:nth-child(3)').each(function () {
            var cell = $(this);
            if (cell.find('span').length === 0 && $.trim(cell.text()) !== '') {
                cell.html('<span class="vm-oi-code">' + $.trim(cell.text()) + '</span>');
            }
        });
    }

    function vmTableScrollers() {
        tabContent().children('.tab-pane').each(function () {
            var $pane = $(this);
            if (vmOiScrollPaneIds.indexOf($pane.attr('id') || '') < 0) {
                return;
            }
            function vmBindTableScrollUi($box) {
                if (!$box.find('table.table').length || $box.find('.vm-oi-scrollbtn').length) {
                    return;
                }
                var prev = $('<button type="button" class="vm-oi-scrollbtn vm-oi-prev" title="Left scroll">&#8249;</button>');
                var next = $('<button type="button" class="vm-oi-scrollbtn vm-oi-next" title="Right scroll">&#8250;</button>');
                $box.append(prev).append(next);
                function sync() {
                    vmSyncScrollBox($box);
                }
                prev.on('click', function () {
                    $box.animate({ scrollLeft: $box.scrollLeft() - 320 }, 250);
                });
                next.on('click', function () {
                    $box.animate({ scrollLeft: $box.scrollLeft() + 320 }, 250);
                });
                $box.on('scroll', sync);
                $(window).on('resize', sync);
                setTimeout(sync, 300);
                sync();
            }
            $pane.find('> .vm-oi-table-scroll-shell').each(function () {
                vmBindTableScrollUi($(this));
            });
            $pane.children('.col-md-12').each(function () {
                var $col = $(this);
                if ($col.parent().hasClass('vm-oi-table-scroll-shell')) {
                    return;
                }
                if (!$col.hasClass('vm-oi-hscroll') && $col.closest('#aepsoperator, #Microatmcashoperator').length) {
                    return;
                }
                vmBindTableScrollUi(vmTableScrollHost($col));
            });
        });
    }

    function resolveInitialHref($page) {
        var hash = (window.location.hash || '').replace('#', '');
        if (hash && tabContent().children('.tab-pane#' + hash).length) {
            return '#' + hash;
        }
        var initial = ($page.attr('data-vm-oi-initial') || '').replace(/^#/, '');
        if (initial && tabContent().children('.tab-pane#' + initial).length) {
            return '#' + initial;
        }
        return '#prepaidoperators';
    }

    var vmOiTabsReady = false;

    function initOperatorInfoTabs() {
        var $page = page();
        if (!$page.length || !tabStrip().length || !tabContent().length) {
            return;
        }
        vmClearPaneInlineDisplay();
        vmEnsureScrollShells();
        bindVmOiTabs();
        vmNormalizeOpInfoTabStrip();
        if (vmIsCompactViewport()) {
            vmApplyCompactTableScrollLayout();
        }
        if (vmOiTabsReady) {
            return;
        }
        vmOiTabsReady = true;

        try {
            fillEmptyTimes();
            vmPolishUnitsCodes();
        } catch (errPolish) { }

        vmTableScrollers();

        var initialHref = resolveInitialHref($page);
        var $initLink = tabLink(initialHref);
        if ($initLink.length && !$initLink.parent('li').hasClass('active')) {
            $initLink.one('shown.bs.tab', function () {
                onTabShown($initLink);
            });
            $initLink.tab('show');
        } else {
            onTabShown(tabStrip().find('> li.active > a[data-toggle="tab"]').first());
        }

        $(window).off('hashchange.vmOiTab').on('hashchange.vmOiTab', function () {
            var h = (window.location.hash || '').replace('#', '');
            if (h) {
                vmOpInfoShowTab('#' + h, false);
            }
        });
        $(window).off('resize.vmOiTabStrip orientationchange.vmOiTabStrip').on('resize.vmOiTabStrip orientationchange.vmOiTabStrip', function () {
            vmEnsureScrollShells();
            vmNormalizeOpInfoTabStrip();
            if (vmIsCompactViewport()) {
                vmApplyCompactTableScrollLayout();
            }
        });

        window.vmOpInfoShowTab = vmOpInfoShowTab;
        window.vmOpInfoActivePane = activePane;

        $('#btnOpInfoPdf').off('click.vmOiTab').on('click.vmOiTab', function () {
            document.body.classList.add('oi-printing');
            var after = function () {
                document.body.classList.remove('oi-printing');
                window.removeEventListener('afterprint', after);
            };
            window.addEventListener('afterprint', after);
            window.print();
            setTimeout(function () {
                document.body.classList.remove('oi-printing');
            }, 1500);
        });
        $('#btnOpInfoExport').off('click.vmOiTab').on('click.vmOiTab', function () {
            var $pane = activePane();
            var $table = $pane.find('table.table').first();
            if (!$table.length) {
                return;
            }
            var tabName = ($pane.attr('id') || 'OperatorInfo').replace(/[^a-z0-9]+/gi, '_');
            var d = new Date();
            var stamp = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
            var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
                'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                'xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>' +
                $table.clone().wrap('<div/>').parent().html() + '</body></html>';
            var blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'OperatorInfo_' + tabName + '_' + stamp + '.xls';
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                URL.revokeObjectURL(a.href);
                a.remove();
            }, 500);
        });
    }

    $(function () {
        initOperatorInfoTabs();
    });
})(window.jQuery || window.vmAdminJq);
