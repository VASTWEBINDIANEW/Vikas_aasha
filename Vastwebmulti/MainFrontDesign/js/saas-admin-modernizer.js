(function () {
    "use strict";

    var legacyVisualStyles = [
        "/admindesign/css/style.css",
        "/admindesign/css/style.min.css",
        "/admindesign/css/themes/all-themes.css",
        "/admindesign/css/themes/all-themes.min.css",
        "/admindesign/all-themes.css",
        "/mainfrontdesign/css/dashcustom.css",
        "/mainfrontdesign/css/globalallcss.css",
        "/mainfrontdesign/css/admin-second-design.css",
        "/mainfrontdesign/css/admin-fourth-design.css",
        "/mainfrontdesign/css/admin-third-design.css",
        "/mainfrontdesign/css/retailernewdesigncss.css",
        "/mainfrontdesign/css/new-design.css",
        "/mainfrontdesign/css/design-one.css",
        "/mainfrontdesign/css/seven_design.css",
        "/mainfrontdesign/css/apiuser.css",
        "/mainfrontdesign/css/custom-style.css",
        "/mainfrontdesign/css/style.css",
        "/mainfrontdesign/css/responsive.css",
        "/frontapplicationdesign/css/bootstrap-responsive.css",
        "/frontapplicationdesign/css/style.css",
        "/frontapplicationdesign/css/pluton.css",
        "/retailercss/stylesheet.css",
        "/retailer-custum/custum-retailer.css",
        "/areas/admin/css/admincss.css",
        "/areas/master/mastercss/mastercss.css",
        "/areas/wmaster/mastercss/mastercss.css",
        "/areas/whitelabel/design/css/whitelabel.css",
        "/areas/wretailer/wretailercss/wretailercss.css"
    ];

    var visualProperties = [
        "background",
        "background-color",
        "background-image",
        "border",
        "border-color",
        "border-radius",
        "box-shadow",
        "color",
        "text-shadow"
    ];

    function hrefOf(link) {
        return (link.getAttribute("href") || "").toLowerCase();
    }

    function isLegacyVisual(link) {
        var href = hrefOf(link);
        return legacyVisualStyles.some(function (legacyHref) {
            return href.indexOf(legacyHref) !== -1;
        });
    }

    function disableLegacyVisualStyles() {
        Array.prototype.forEach.call(document.querySelectorAll("link[rel~='stylesheet']"), function (link) {
            if (!isLegacyVisual(link) || link.dataset.saasDisabled === "true") {
                return;
            }

            link.dataset.saasDisabled = "true";
            link.dataset.legacyHref = link.getAttribute("href") || "";
            link.disabled = true;
            link.media = "not all";
        });
    }

    function forceStyle(element, property, value) {
        element.style.setProperty(property, value, "important");
    }

    function normalizeInlineVisuals(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var selector = [
            ".fullbodydycolorbg",
            ".alagimgwithlinear",
            ".navbar",
            "#leftsidebar",
            ".sidebar",
            ".menu",
            ".card",
            ".panel",
            ".well",
            ".thumbnail",
            ".info-box",
            ".info-box-2",
            ".info-box-3",
            ".info-box-4",
            ".modal-content",
            ".table-responsive",
            ".body.table-responsive",
            ".page-header-third",
            "[style*='gradient']",
            "[style*='box-shadow']",
            "[style*='background:']",
            "[style*='background-color']",
            "[style*='background-image']",
            "[style*='border-radius: 0']"
        ].join(",");

        Array.prototype.forEach.call(scope.querySelectorAll(selector), function (element) {
            if (element.dataset.saasInlineNormalized === "true") {
                return;
            }

            element.dataset.saasInlineNormalized = "true";

            if (element.matches(".navbar:not(.sidebar), .card, .panel, .well, .thumbnail, .modal-content, .table-responsive, .body.table-responsive, .page-header-third, .info-box, .info-box-2, .info-box-3, .info-box-4")) {
                forceStyle(element, "background-image", "none");
            }

            if (element.matches(".fullbodydycolorbg, .alagimgwithlinear, #leftsidebar, .sidebar, .menu")) {
                forceStyle(element, "background-image", "linear-gradient(180deg, #0b1220 0%, #111827 58%, #080d18 100%)");
            }

            if (element.matches(".card, .panel, .well, .thumbnail, .modal-content, .table-responsive, .body.table-responsive, .page-header-third, .info-box, .info-box-2, .info-box-3, .info-box-4")) {
                forceStyle(element, "border-radius", "22px");
            }

            if (element.matches("button.fullbodydycolorbg, .btn.fullbodydycolorbg, input.fullbodydycolorbg")) {
                forceStyle(element, "background-image", "none");
                forceStyle(element, "background-color", "#2563eb");
                forceStyle(element, "color", "#ffffff");
            }
        });
    }



    var iconMap = [
        { match: /dashboard|home|deshboard/i, icon: "bi-speedometer2" },
        { match: /profile|user|retailer|dealer|master|employee|customer|kyc/i, icon: "bi-person-badge" },
        { match: /wallet|balance|fund|amount|purchase|ledger|credit|debit|settlement|bank/i, icon: "bi-wallet2" },
        { match: /report|history|statement|daybook|invoice|gst|tds/i, icon: "bi-clipboard-data" },
        { match: /recharge|mobile|dth|operator|utility|electricity|water|gas|bill/i, icon: "bi-lightning-charge" },
        { match: /travel|flight|bus|hotel|air/i, icon: "bi-airplane" },
        { match: /setting|security|password|theme|logo|api|switch|commission|slab/i, icon: "bi-gear" },
        { match: /complaint|support|ticket|message|notification|alert/i, icon: "bi-chat-dots" },
        { match: /product|e-?commerce|cart|vendor|order/i, icon: "bi-bag" },
        { match: /pan|aadhaar|aadhar|card|certificate|document/i, icon: "bi-credit-card-2-front" },
        { match: /logout|sign out/i, icon: "bi-box-arrow-right" }
    ];

    function iconForText(text) {
        var value = (text || "").replace(/\s+/g, " ").trim();
        for (var index = 0; index < iconMap.length; index += 1) {
            if (iconMap[index].match.test(value)) {
                return iconMap[index].icon;
            }
        }
        return "bi-circle";
    }

    function normalizeText(value) {
        return (value || "").replace(/[-–—]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    }

    function normalizeHref(value) {
        return (value || "").replace(/^https?:\/\/[^/]+/i, "").replace(/\?.*$/, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();
    }

    function sidebarRoots(root) {
        var scope = root && root.querySelectorAll ? root : document;
        return Array.prototype.slice.call(scope.querySelectorAll("#leftsidebar, aside.sidebar, .sidebar, .leftside-menu-retailer, .wretailer-leftsidebar, .whitel-label-manu"));
    }

    function ensureIcon(anchor) {
        if (!anchor || anchor.dataset.saasIconReady === "true") {
            return;
        }

        var text = normalizeText(anchor.textContent);
        var icon = document.createElement("i");
        icon.className = "bi " + iconForText(text) + " saas-nav-icon";
        icon.setAttribute("aria-hidden", "true");

        var firstContent = Array.prototype.find.call(anchor.childNodes, function (node) {
            return node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim());
        });

        anchor.insertBefore(icon, firstContent || anchor.firstChild);
        anchor.dataset.saasIconReady = "true";
    }

    function removeBrokenMenuImages(root) {
        var scope = root && root.querySelectorAll ? root : document;
        Array.prototype.forEach.call(scope.querySelectorAll("#leftsidebar a img, aside.sidebar a img, .leftside-menu-retailer a img, .wretailer-leftsidebar a img, .whitel-label-manu a img"), function (img) {
            img.setAttribute("aria-hidden", "true");
            img.classList.add("saas-legacy-menu-image");
            img.style.setProperty("display", "none", "important");
        });
    }

    function dedupeMenuItems(root) {
        sidebarRoots(root).forEach(function (sidebar) {
            Array.prototype.forEach.call(sidebar.querySelectorAll("ul"), function (list) {
                var seen = Object.create(null);
                Array.prototype.forEach.call(list.children, function (item) {
                    if (!item || item.tagName !== "LI") {
                        return;
                    }

                    var anchor = item.querySelector(":scope > a, :scope > span > a");
                    if (!anchor) {
                        return;
                    }

                    var text = normalizeText(anchor.textContent);
                    var href = normalizeHref(anchor.getAttribute("href"));
                    var key = (href && href !== "javascript:void(0)" && href !== "#" ? href : text);
                    if (!key || item.querySelector("ul")) {
                        return;
                    }

                    if (seen[key]) {
                        item.classList.add("saas-duplicate-menu-item");
                        item.style.setProperty("display", "none", "important");
                    } else {
                        seen[key] = true;
                    }
                });
            });
        });
    }

    function normalizeSidebarMenus(root) {
        sidebarRoots(root).forEach(function (sidebar) {
            sidebar.classList.add("saas-clean-sidebar");
            Array.prototype.forEach.call(sidebar.querySelectorAll("a"), function (anchor) {
                var href = anchor.getAttribute("href") || "";
                var childMenu = anchor.parentElement && anchor.parentElement.querySelector(":scope > ul");
                if (childMenu || anchor.classList.contains("menu-toggle") || href === "javascript:void(0);" || href === "javascript:void(0)" || href === "#") {
                    anchor.classList.add("saas-menu-parent");
                    if (!anchor.querySelector(".saas-menu-caret")) {
                        var caret = document.createElement("i");
                        caret.className = "bi bi-chevron-down saas-menu-caret";
                        caret.setAttribute("aria-hidden", "true");
                        anchor.appendChild(caret);
                    }
                }
                ensureIcon(anchor);
            });
        });

        removeBrokenMenuImages(root);
        dedupeMenuItems(root);
    }

    function simplifyDashboard(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var dashboard = scope.querySelector(".tmw-dashaboard, .dash-board-top, .sevent_box") || document.querySelector(".tmw-dashaboard, .dash-board-top, .sevent_box");
        if (!dashboard) {
            return;
        }

        document.body.classList.add("saas-dashboard-clean");
        Array.prototype.forEach.call(document.querySelectorAll(".dash-board-top, .sevent_box .row, .tmw-dashaboard .row"), function (row) {
            row.classList.add("saas-dashboard-grid");
        });

        Array.prototype.forEach.call(document.querySelectorAll(".dash-board-top .info-box-4, .tmw-dashaboard .info-box-4, .info-box, .info-box-2, .info-box-3"), function (card, index) {
            card.classList.add("saas-stat-card");
            if (index > 11) {
                card.classList.add("saas-secondary-widget");
            }
        });
    }



    var adminSidebarSections = [
        /dashboard/i,
        /my profile/i,
        /important\s+trans\.?\s+reports/i,
        /wallet\s*&\s*accounts\s+activity|wallet\s+accounts\s+activity/i,
        /upi\s*\(?qr\)?\s*&\s*gateway\s+activity|upi.*gateway/i
    ];

    var clutterTopbarLabels = [
        /more option/i,
        /app setting/i,
        /pan\/?aadhar|pan\/?aadhaar/i,
        /vb alerts/i,
        /failsucc|fail\s*succ/i,
        /search user/i,
        /hold amt/i,
        /api balance/i,
        /^notification$/i,
        /wallet-q|wallet q/i,
        /sell comm/i,
        /user\s*a\/c\s*q|user a c q/i,
        /chat'?s/i,
        /dispute'?s/i,
        /renewal\s+date.*web\s+info|renewal date/i
    ];

    function isAdminPanel() {
        return /\/admin\//i.test(window.location.pathname) || !!document.querySelector("a[href*='/ADMIN/'], a[href*='~/ADMIN/'], a[href*='/Admin/']");
    }

    function matchesAny(text, patterns) {
        return patterns.some(function (pattern) {
            return pattern.test(text || "");
        });
    }

    function visibleText(element) {
        return normalizeText(element ? element.textContent : "");
    }

    function hideElement(element, className) {
        if (!element) {
            return;
        }
        element.classList.add(className || "saas-hidden-clutter");
        element.setAttribute("aria-hidden", "true");
        element.style.setProperty("display", "none", "important");
    }

    function cleanAdminSidebar() {
        if (!isAdminPanel()) {
            return;
        }

        var primaryMenu = document.querySelector("#leftsidebar #custnav ul.list, #leftsidebar .menu#custnav ul.list");
        if (!primaryMenu) {
            return;
        }

        primaryMenu.classList.add("saas-admin-primary-menu");
        Array.prototype.forEach.call(primaryMenu.children, function (item) {
            if (!item || item.tagName !== "LI") {
                return;
            }

            var itemText = visibleText(item);
            var keep = matchesAny(itemText, adminSidebarSections);
            if (!keep) {
                hideElement(item, "saas-admin-hidden-menu-item");
                return;
            }

            item.classList.add("saas-admin-kept-menu-item");
            var parent = item.querySelector(":scope > a, :scope > span > a");
            if (parent && item.querySelector("ul")) {
                parent.classList.add("saas-menu-parent");
            }
        });
    }

    function cleanAdminTopbar() {
        if (!isAdminPanel()) {
            return;
        }

        var topbar = document.querySelector(".tmw-layoutht, .navbar:not(.sidebar)");
        if (!topbar) {
            return;
        }

        topbar.classList.add("saas-clean-topbar");
        Array.prototype.forEach.call(topbar.querySelectorAll("li, .list-group, center, .renewal-card, .web-info-card"), function (node) {
            var text = visibleText(node);
            var title = normalizeText((node.querySelector("a") || node).getAttribute ? ((node.querySelector("a") || node).getAttribute("title") || "") : "");
            var href = normalizeText((node.querySelector("a") || node).getAttribute ? ((node.querySelector("a") || node).getAttribute("href") || "") : "");
            if (matchesAny(text + " " + title + " " + href, clutterTopbarLabels)) {
                hideElement(node, "saas-admin-hidden-topbar-item");
            }
        });

        var logoutControls = topbar.querySelectorAll("form[action*='LogOff'], button[title*='Logout'], .logout2");
        Array.prototype.forEach.call(logoutControls, function (node, index) {
            if (index > 0) {
                hideElement(node, "saas-admin-duplicate-logout");
            }
        });
    }

    function applyPanelSpecificCleanup() {
        cleanAdminSidebar();
        cleanAdminTopbar();
    }

    function normalizeComponents(root) {
        var scope = root && root.querySelectorAll ? root : document;

        document.documentElement.classList.add("saas-admin-ui");
        if (document.body) {
            document.body.classList.add("saas-admin-ui");
        }

        Array.prototype.forEach.call(scope.querySelectorAll("table"), function (table) {
            table.classList.add("table");
            table.classList.add("saas-table");
        });

        Array.prototype.forEach.call(scope.querySelectorAll("input:not([type]), input[type='text'], input[type='password'], input[type='email'], input[type='number'], input[type='tel'], input[type='date'], input[type='search'], select, textarea"), function (field) {
            if (!field.classList.contains("form-control") && !field.closest(".bootstrap-select")) {
                field.classList.add("form-control");
            }
        });

        Array.prototype.forEach.call(scope.querySelectorAll("button, input[type='button'], input[type='submit'], input[type='reset'], a.btn"), function (button) {
            if (!button.classList.contains("btn")) {
                button.classList.add("btn");
            }
        });

        Array.prototype.forEach.call(scope.querySelectorAll(".card, .panel, .well, .thumbnail, .info-box, .info-box-2, .info-box-3, .info-box-4"), function (card) {
            card.classList.add("saas-surface");
        });

        normalizeInlineVisuals(scope);
        normalizeSidebarMenus(scope);
        simplifyDashboard(scope);
        applyPanelSpecificCleanup();
    }

    function observeDynamicContent() {
        if (!window.MutationObserver || !document.body) {
            return;
        }

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    if (node.nodeType !== 1) {
                        return;
                    }

                    normalizeComponents(node);
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function boot() {
        disableLegacyVisualStyles();
        normalizeComponents(document);
        observeDynamicContent();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    window.SaasAdminModernizer = {
        refresh: function () {
            disableLegacyVisualStyles();
            normalizeComponents(document);
        }
    };
}());
