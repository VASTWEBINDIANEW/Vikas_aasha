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
