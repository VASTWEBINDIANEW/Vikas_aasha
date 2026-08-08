/**
 * Admin layout dynamic theme — topbar + sidebar colors (solid & gradient) v2
 */
(function (window, document) {
    "use strict";

    var STORAGE_KEY = "vmAdminLayoutTheme";
    var root = document.documentElement;
    var body = document.body;

    function buildBg(cfg) {
        if (!cfg) return "";
        if (cfg.type === "gradient") {
            var angle = cfg.angle != null ? cfg.angle : 180;
            return "linear-gradient(" + angle + "deg, " + cfg.from + " 0%, " + cfg.to + " 100%)";
        }
        return cfg.color || cfg.from || "#ffffff";
    }

    function isDark(hex) {
        if (!hex || hex.indexOf("linear") >= 0) return true;
        var c = hex.replace("#", "");
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        }
        var r = parseInt(c.substr(0, 2), 16);
        var g = parseInt(c.substr(2, 2), 16);
        var b = parseInt(c.substr(4, 2), 16);
        var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum < 0.55;
    }

    var presets = [
        { id: "default", name: "Classic", topbar: { type: "solid", color: "#ffffff" }, sidebar: { type: "solid", color: "#0b1220" }, topbarDark: false },
        { id: "pearl", name: "Pearl", topbar: { type: "solid", color: "#f8fafc" }, sidebar: { type: "solid", color: "#111827" }, topbarDark: false },
        { id: "ocean", name: "Ocean", topbar: { type: "solid", color: "#f0f9ff" }, sidebar: { type: "solid", color: "#0c4a6e" }, topbarDark: false },
        { id: "royal", name: "Royal", topbar: { type: "solid", color: "#f5f3ff" }, sidebar: { type: "solid", color: "#4c1d95" }, topbarDark: false },
        { id: "emerald", name: "Emerald", topbar: { type: "solid", color: "#f0fdf4" }, sidebar: { type: "solid", color: "#065f46" }, topbarDark: false },
        { id: "sunset", name: "Sunset", topbar: { type: "solid", color: "#fff7ed" }, sidebar: { type: "solid", color: "#9a3412" }, topbarDark: false },
        { id: "midnight", name: "Midnight", topbar: { type: "solid", color: "#f1f5f9" }, sidebar: { type: "solid", color: "#000000" }, topbarDark: false },
        { id: "coral", name: "Coral", topbar: { type: "solid", color: "#fff1f2" }, sidebar: { type: "solid", color: "#be123c" }, topbarDark: false },
        { id: "teal", name: "Teal", topbar: { type: "solid", color: "#f0fdfa" }, sidebar: { type: "solid", color: "#0f766e" }, topbarDark: false },
        { id: "indigo", name: "Indigo", topbar: { type: "solid", color: "#eef2ff" }, sidebar: { type: "solid", color: "#312e81" }, topbarDark: false },
        { id: "rose", name: "Rose", topbar: { type: "solid", color: "#fdf2f8" }, sidebar: { type: "solid", color: "#9d174d" }, topbarDark: false },
        { id: "forest", name: "Forest", topbar: { type: "solid", color: "#f7fee7" }, sidebar: { type: "solid", color: "#14532d" }, topbarDark: false },
        { id: "slate", name: "Slate", topbar: { type: "solid", color: "#ffffff" }, sidebar: { type: "solid", color: "#334155" }, topbarDark: false },
        { id: "gold", name: "Gold", topbar: { type: "solid", color: "#fffbeb" }, sidebar: { type: "solid", color: "#78350f" }, topbarDark: false },
        { id: "azure", name: "Azure", topbar: { type: "solid", color: "#eff6ff" }, sidebar: { type: "solid", color: "#1e40af" }, topbarDark: false }
    ];

    function normalizeTheme(raw) {
        if (!raw) return null;
        var topbarBg = raw.topbarBg || buildBg(raw.topbar);
        var sidebarBg = raw.sidebarBg || buildBg(raw.sidebar);
        if (!topbarBg || !sidebarBg) return null;
        return {
            id: raw.id || raw.presetId || "custom",
            name: raw.name || "Custom",
            topbarBg: topbarBg,
            sidebarBg: sidebarBg,
            topbarDark: raw.topbarDark != null ? raw.topbarDark : isTopbarDarkColor(topbarBg),
            sidebarDark: raw.sidebarDark != null ? raw.sidebarDark : isSidebarDarkColor(sidebarBg)
        };
    }

    function themeFromPreset(preset) {
        return {
            id: preset.id,
            name: preset.name,
            topbarBg: buildBg(preset.topbar),
            sidebarBg: buildBg(preset.sidebar),
            topbarDark: !!preset.topbarDark,
            sidebarDark: preset.sidebarDark != null ? !!preset.sidebarDark : isSidebarDarkColor(buildBg(preset.sidebar))
        };
    }

    function updateLivePreview(theme) {
        var topEl = document.getElementById("vm-preview-top");
        var sideEl = document.getElementById("vm-preview-side");
        if (!theme) return;
        if (topEl) topEl.style.background = theme.topbarBg;
        if (sideEl) sideEl.style.background = theme.sidebarBg;
    }

    function applyElementBg(id, bg, selectors) {
        var el = document.getElementById(id);
        if (el) {
            el.style.setProperty("background", bg, "important");
            el.style.setProperty("background-image", bg, "important");
            el.setAttribute("data-vm-theme-managed", "true");
        }
        if (selectors) {
            document.querySelectorAll(selectors).forEach(function (node) {
                node.style.setProperty("background", bg, "important");
                node.style.setProperty("background-image", bg, "important");
            });
        }

        var custnav = document.getElementById("custnav");
        if (custnav && id === "leftsidebar") {
            custnav.style.setProperty("background", "transparent", "important");
            custnav.style.setProperty("background-image", "none", "important");
        }
    }

    function applyTheme(theme) {
        theme = normalizeTheme(theme);
        if (!theme) return;

        root.style.setProperty("--vm-admin-topbar-bg", theme.topbarBg);
        root.style.setProperty("--vm-admin-sidebar-bg", theme.sidebarBg);

        applyElementBg("admin-top-header", theme.topbarBg, ".admin-header-v2, .saas-admin-topbar");
        applyElementBg("leftsidebar", theme.sidebarBg, null);

        if (theme.topbarDark) {
            root.style.setProperty("--vm-admin-topbar-border", "rgba(255,255,255,0.12)");
            root.style.setProperty("--vm-admin-topbar-text", "#e2e8f0");
            root.style.setProperty("--vm-admin-topbar-text-hover", "#ffffff");
            root.style.setProperty("--vm-admin-topbar-btn-hover-bg", "rgba(255,255,255,0.12)");
            body.classList.add("vm-admin-topbar-dark");
        } else {
            root.style.setProperty("--vm-admin-topbar-border", "#e8edf3");
            root.style.setProperty("--vm-admin-topbar-text", "#334155");
            root.style.setProperty("--vm-admin-topbar-text-hover", "#2563eb");
            root.style.setProperty("--vm-admin-topbar-btn-hover-bg", "#eef4ff");
            body.classList.remove("vm-admin-topbar-dark");
        }

        /* Sidebar text + interaction tokens */
        if (theme.sidebarDark !== false) {
            root.style.setProperty("--vm-admin-sidebar-text", "#f8fafc");
            root.style.setProperty("--vm-admin-sidebar-muted", "#e2e8f0");
            root.style.setProperty("--vm-admin-sidebar-hover-bg", "rgba(255, 255, 255, 0.12)");
            root.style.setProperty("--vm-admin-sidebar-active-bg", "rgba(255, 255, 255, 0.18)");
            root.style.setProperty("--vm-admin-sidebar-icon-bg", "rgba(255, 255, 255, 0.96)");
            root.style.setProperty("--vm-admin-sidebar-icon-color", "#334155");
            root.style.setProperty("--vm-admin-sidebar-sub-text", "rgba(248, 250, 252, 0.9)");
            body.classList.add("vm-admin-sidebar-dark");
            body.classList.remove("vm-admin-sidebar-light");
        } else {
            root.style.setProperty("--vm-admin-sidebar-text", "#1e293b");
            root.style.setProperty("--vm-admin-sidebar-muted", "#475569");
            root.style.setProperty("--vm-admin-sidebar-hover-bg", "rgba(15, 23, 42, 0.06)");
            root.style.setProperty("--vm-admin-sidebar-active-bg", "rgba(37, 99, 235, 0.14)");
            root.style.setProperty("--vm-admin-sidebar-icon-bg", "#f1f5f9");
            root.style.setProperty("--vm-admin-sidebar-icon-color", "#475569");
            root.style.setProperty("--vm-admin-sidebar-sub-text", "#475569");
            body.classList.add("vm-admin-sidebar-light");
            body.classList.remove("vm-admin-sidebar-dark");
        }

        body.classList.add("vm-admin-theme-active");
        updateLivePreview(theme);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        } catch (e) { /* ignore */ }

        document.querySelectorAll(".vm-admin-theme-swatch").forEach(function (btn) {
            btn.classList.toggle("vm-active", btn.getAttribute("data-theme-id") === theme.id);
        });
    }

    function getSavedTheme() {
        if (window.__vmAdminServerTheme && window.__vmAdminServerTheme.topbarBg && window.__vmAdminServerTheme.sidebarBg) {
            return normalizeTheme(window.__vmAdminServerTheme);
        }

        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return normalizeTheme(JSON.parse(saved));
        } catch (e) { /* ignore */ }

        return themeFromPreset(presets[0]);
    }

    function saveToServer(theme) {
        if (!window.vmAdminThemeSaveUrl) return;
        try {
            if (window.jQuery) {
                jQuery.post(window.vmAdminThemeSaveUrl, { themeJson: JSON.stringify(theme) })
                    .done(function (res) {
                        if (res && res.success && res.theme) {
                            window.__vmAdminServerTheme = res.theme;
                            try {
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(res.theme));
                            } catch (e) { /* ignore */ }
                        }
                    });
            }
        } catch (e) { /* ignore */ }
    }

    function renderSwatchPreview(preset) {
        var top = buildBg(preset.topbar);
        var side = buildBg(preset.sidebar);
        return '<span class="vm-admin-theme-swatch-preview">' +
            '<span class="vm-admin-theme-swatch-top" style="background:' + top + '"></span>' +
            '<span class="vm-admin-theme-swatch-side" style="background:' + side + '"></span>' +
            '</span>' +
            '<span class="vm-admin-theme-swatch-name">' + preset.name + '</span>';
    }

    function buildSwatchGrid(container) {
        if (!container) return;
        container.innerHTML = "";
        presets.forEach(function (preset) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "vm-admin-theme-swatch";
            btn.setAttribute("data-theme-id", preset.id);
            btn.setAttribute("title", preset.name);
            btn.setAttribute("aria-label", preset.name + " theme");
            btn.innerHTML = renderSwatchPreview(preset);
            btn.addEventListener("click", function () {
                var t = themeFromPreset(preset);
                applyTheme(t);
                saveToServer(t);
            });
            container.appendChild(btn);
        });
    }

    function isEmbeddedPanel() {
        if (window.vmAdminThemeEmbedded) return true;
        var panel = document.getElementById("vm-admin-theme-panel");
        return !!(panel && panel.classList.contains("vm-admin-theme-panel--embedded"));
    }

    function setPanelOpen(open) {
        if (isEmbeddedPanel()) return;
        var fab = document.getElementById("vm-admin-theme-fab");
        var panel = document.getElementById("vm-admin-theme-panel");
        var overlay = document.getElementById("vm-admin-theme-overlay");
        if (!panel) return;

        panel.classList.toggle("vm-open", open);
        if (overlay) overlay.classList.toggle("vm-open", open);
        if (fab) {
            fab.classList.toggle("vm-open", open);
            fab.setAttribute("aria-expanded", open ? "true" : "false");
        }
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        if (overlay) overlay.setAttribute("aria-hidden", open ? "false" : "true");
    }

    function bindColorHexSync() {
        document.querySelectorAll('.vm-admin-theme-color-wrap input[type="color"]').forEach(function (input) {
            var hexEl = document.querySelector('.vm-admin-theme-hex[data-for="' + input.id + '"]');
            var sync = function () {
                if (hexEl) hexEl.textContent = input.value;
            };
            input.addEventListener("input", sync);
            sync();
        });
    }

    function isTopbarDarkColor(bg) {
        if (!bg) return false;
        if (bg.indexOf("linear") >= 0) {
            var matches = bg.match(/#([0-9a-fA-F]{3,8})/g);
            if (matches && matches.length) {
                for (var i = 0; i < matches.length; i++) {
                    if (isDark(matches[i])) return true;
                }
            }
            return true;
        }
        return isDark(bg);
    }

    function isSidebarDarkColor(bg) {
        return isTopbarDarkColor(bg);
    }

    function getCustomThemeFromInputs() {
        var top1 = document.getElementById("vm-theme-top-c1");
        var top2 = document.getElementById("vm-theme-top-c2");
        var side1 = document.getElementById("vm-theme-side-c1");
        var side2 = document.getElementById("vm-theme-side-c2");
        var topGrad = document.getElementById("vm-theme-top-gradient");
        var sideGrad = document.getElementById("vm-theme-side-gradient");
        var topbarBg, sidebarBg, topbarDark, sidebarDark;

        if (topGrad && topGrad.checked && top1 && top2) {
            topbarBg = "linear-gradient(135deg, " + top1.value + " 0%, " + top2.value + " 100%)";
            topbarDark = isTopbarDarkColor(topbarBg);
        } else if (top1) {
            topbarBg = top1.value;
            topbarDark = isDark(top1.value);
        } else {
            topbarBg = "#ffffff";
            topbarDark = false;
        }

        if (sideGrad && sideGrad.checked && side1 && side2) {
            sidebarBg = "linear-gradient(180deg, " + side1.value + " 0%, " + side2.value + " 100%)";
            sidebarDark = isSidebarDarkColor(sidebarBg);
        } else if (side1) {
            sidebarBg = side1.value;
            sidebarDark = isDark(side1.value);
        } else {
            sidebarBg = "#0b1220";
            sidebarDark = true;
        }

        return {
            id: "custom",
            name: "Custom",
            topbarBg: topbarBg,
            sidebarBg: sidebarBg,
            topbarDark: topbarDark,
            sidebarDark: sidebarDark
        };
    }

    function initPanel() {
        var fab = document.getElementById("vm-admin-theme-fab");
        var panel = document.getElementById("vm-admin-theme-panel");
        var overlay = document.getElementById("vm-admin-theme-overlay");
        var closeBtn = document.getElementById("vm-admin-theme-close");
        var embedded = isEmbeddedPanel();

        if (!panel) return;

        if (embedded) {
            panel.classList.add("vm-open");
            panel.setAttribute("aria-hidden", "false");
        } else if (fab) {
            fab.addEventListener("click", function (e) {
                e.stopPropagation();
                setPanelOpen(!panel.classList.contains("vm-open"));
            });
        }

        if (!embedded && closeBtn) {
            closeBtn.addEventListener("click", function () {
                setPanelOpen(false);
            });
        }

        if (!embedded && overlay) {
            overlay.addEventListener("click", function () {
                setPanelOpen(false);
            });
        }

        if (!embedded) {
            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && panel && panel.classList.contains("vm-open")) {
                    setPanelOpen(false);
                }
            });
        }

        var grids = document.querySelectorAll("[data-vm-theme-grid]");
        grids.forEach(buildSwatchGrid);

        var current = getSavedTheme();
        if (current) {
            document.querySelectorAll(".vm-admin-theme-swatch").forEach(function (btn) {
                btn.classList.toggle("vm-active", btn.getAttribute("data-theme-id") === current.id);
            });
        }

        bindColorHexSync();

        document.querySelectorAll('.vm-admin-theme-color-wrap input[type="color"], #vm-theme-top-gradient, #vm-theme-side-gradient').forEach(function (el) {
            el.addEventListener("input", function () {
                updateLivePreview(getCustomThemeFromInputs());
            });
            el.addEventListener("change", function () {
                updateLivePreview(getCustomThemeFromInputs());
            });
        });

        var applyBtn = document.getElementById("vm-admin-theme-apply-custom");
        if (applyBtn) {
            applyBtn.addEventListener("click", function () {
                var custom = getCustomThemeFromInputs();
                applyTheme(custom);
                saveToServer(custom);
            });
        }

        var resetBtn = document.getElementById("vm-admin-theme-reset");
        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                var t = themeFromPreset(presets[0]);
                applyTheme(t);
                saveToServer(t);
                var top1 = document.getElementById("vm-theme-top-c1");
                var top2 = document.getElementById("vm-theme-top-c2");
                var side1 = document.getElementById("vm-theme-side-c1");
                var side2 = document.getElementById("vm-theme-side-c2");
                if (top1) top1.value = "#ffffff";
                if (top2) top2.value = "#2563eb";
                if (side1) side1.value = "#0b1220";
                if (side2) side2.value = "#111827";
                bindColorHexSync();
            });
        }

        applyTheme(getSavedTheme());
        setTimeout(function () { applyTheme(getSavedTheme()); }, 0);
        setTimeout(function () { applyTheme(getSavedTheme()); }, 300);
        window.addEventListener("load", function () {
            applyTheme(getSavedTheme());
        });
    }

    window.VmAdminTheme = {
        presets: presets,
        apply: applyTheme,
        getSaved: getSavedTheme,
        buildBg: buildBg,
        themeFromPreset: themeFromPreset,
        openPanel: function () { setPanelOpen(true); },
        closePanel: function () { setPanelOpen(false); }
    };

    applyTheme(getSavedTheme());

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPanel);
    } else {
        initPanel();
    }
})(window, document);
