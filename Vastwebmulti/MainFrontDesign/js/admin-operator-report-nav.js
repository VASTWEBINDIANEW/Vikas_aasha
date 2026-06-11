/**
 * ADMIN — menuoperatorreport active state
 */
(function (window, document) {
    'use strict';

    var ROUTE_KEYS = [
        { key: 'live', match: /operator_report_new/i },
        { key: 'incoming', match: /\/incoming/i },
        { key: 'roffer', match: /roffer_history|roffer_comm|offer_income/i },
        { key: 'dashboard', match: /\/dashboard/i }
    ];

    function resolveActiveKey(path) {
        var i;
        for (i = 0; i < ROUTE_KEYS.length; i++) {
            if (ROUTE_KEYS[i].match.test(path)) {
                return ROUTE_KEYS[i].key;
            }
        }
        return '';
    }

    function initNav() {
        var nav = document.getElementById('vmOprNav');
        if (!nav) {
            return;
        }
        var path = (window.location.pathname || '').toLowerCase();
        var activeKey = resolveActiveKey(path);
        var links = nav.querySelectorAll('.vm-opr-nav__link, a.vm-opr-nav__link');
        var i;
        for (i = 0; i < links.length; i++) {
            var link = links[i];
            var key = link.getAttribute('data-vm-opr-key') || '';
            if (key && key === activeKey) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNav);
    } else {
        initNav();
    }
})(window, document);
