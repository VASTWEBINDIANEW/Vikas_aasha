/**
 * VM — App Option page (ADMIN/Home/APP_Option)
 */
(function (window, document) {
    'use strict';

    var VM_TAB_PANELS = {
        vmTabColor: 'vmPanelColor',
        vmTabIconTheme: 'vmPanelIconTheme',
        vmTabIconImg: 'vmPanelIconImg',
        vmTabKyc: 'vmPanelKyc',
        vmTabFaq: 'vmPanelFaq',
        vmTabSlider: 'vmPanelSlider',
        vmTabMessage: 'vmPanelMessage'
    };

    var VM_OTP_OVERLAY_IDS = [
        'vmOverlayLoad',
        'vmOtpDashboard',
        'vmOtpFront',
        'vmOtpBackground',
        'vmOtpBtnColor',
        'vmOtpIconTheme'
    ];

    function notify(title, text, type) {
        if (typeof window.swal === 'function') {
            window.swal(title, text, type);
        } else if (typeof window.toastr !== 'undefined') {
            if (type === 'success') {
                window.toastr.success(text || title);
            } else if (type === 'error') {
                window.toastr.error(text || title);
            } else {
                window.toastr.info(text || title);
            }
        } else {
            window.alert((title ? title + ': ' : '') + (text || ''));
        }
    }

    window.vmAppOptionNotify = notify;

    function vmMountOverlays() {
        var i;
        var el;
        for (i = 0; i < VM_OTP_OVERLAY_IDS.length; i++) {
            el = document.getElementById(VM_OTP_OVERLAY_IDS[i]);
            if (el && el.parentNode !== document.body) {
                document.body.appendChild(el);
            }
        }
    }

    window.vmShowAppOverlay = function (overlayId) {
        vmMountOverlays();
        var el = document.getElementById(overlayId);
        if (!el) {
            return;
        }
        el.classList.add('vm-app-overlay-open');
        el.style.display = 'flex';
        el.setAttribute('aria-hidden', 'false');
        document.body.classList.add('vm-app-otp-open');
    };

    window.vmHideAppOverlay = function (overlayId) {
        var el = document.getElementById(overlayId);
        if (!el) {
            return;
        }
        el.classList.remove('vm-app-overlay-open');
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
        var anyOpen = false;
        var i;
        for (i = 0; i < VM_OTP_OVERLAY_IDS.length; i++) {
            el = document.getElementById(VM_OTP_OVERLAY_IDS[i]);
            if (el && el.classList.contains('vm-app-overlay-open')) {
                anyOpen = true;
                break;
            }
        }
        if (!anyOpen) {
            document.body.classList.remove('vm-app-otp-open');
        }
    };

    window.vmHideAllAppOverlays = function () {
        var i;
        for (i = 0; i < VM_OTP_OVERLAY_IDS.length; i++) {
            window.vmHideAppOverlay(VM_OTP_OVERLAY_IDS[i]);
        }
        document.body.classList.remove('vm-app-otp-open');
    };

    function hidePanel(el) {
        el.style.display = 'none';
        el.classList.remove('vm-app-panel-open');
    }

    function showPanel(panelId) {
        var key;
        for (key in VM_TAB_PANELS) {
            if (VM_TAB_PANELS.hasOwnProperty(key)) {
                var el = document.getElementById(VM_TAB_PANELS[key]);
                if (el) {
                    hidePanel(el);
                }
            }
        }
        var panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'block';
            panel.classList.add('vm-app-panel-open');
            var scroll = panel.querySelector('.vm-app-panel-scroll');
            if (scroll) {
                scroll.scrollTop = 0;
            }
        }
    }

    function setActiveTab(tabId) {
        var nav = document.querySelector('.vm-app-option-page .vm-app-tabs-nav');
        if (!nav) {
            return;
        }
        var buttons = nav.querySelectorAll('button[role="tab"]');
        var i;
        for (i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('vm-app-tab-active', 'active');
            buttons[i].setAttribute('aria-selected', 'false');
        }
        var activeBtn = document.getElementById(tabId);
        if (activeBtn) {
            activeBtn.classList.add('vm-app-tab-active', 'active');
            activeBtn.setAttribute('aria-selected', 'true');
        }
    }

    window.vmAppTab = function (tabId) {
        if (!VM_TAB_PANELS[tabId]) {
            return;
        }
        setActiveTab(tabId);
        showPanel(VM_TAB_PANELS[tabId]);
        if (VM_TAB_PANELS[tabId] === 'vmPanelMessage' && typeof window.vmLoadAppMessages === 'function') {
            window.vmLoadAppMessages(false);
        }
    };

    window.ButtonActive = window.vmAppTab;
    window.vmAppOptionTab = window.vmAppTab;

    window.vmAppOptionHideOtp = window.vmHideAllAppOverlays;

    window.HidePoPup = function () {
        window.vmHideAllAppOverlays();
        var inputs = ['vmOtpDashInput', 'vmOtpFrontInput', 'vmOtpBgInput', 'vmOtpBtnColorInput', 'vmOtpThemeInput'];
        var j;
        for (j = 0; j < inputs.length; j++) {
            var inp = document.getElementById(inputs[j]);
            if (inp) {
                inp.value = '';
            }
        }
    };

    function bindTabClicks() {
        var nav = document.querySelector('.vm-app-option-page .vm-app-tabs-nav');
        if (!nav || nav.getAttribute('data-vm-tabs-bound') === '1') {
            return;
        }
        nav.setAttribute('data-vm-tabs-bound', '1');
        nav.addEventListener('click', function (ev) {
            var btn = ev.target.closest('button[role="tab"]');
            if (!btn || !btn.id) {
                return;
            }
            window.vmAppTab(btn.id);
        });
    }

    function initPage() {
        vmMountOverlays();
        bindTabClicks();
        var key;
        for (key in VM_TAB_PANELS) {
            if (!VM_TAB_PANELS.hasOwnProperty(key)) {
                continue;
            }
            var el = document.getElementById(VM_TAB_PANELS[key]);
            if (!el) {
                continue;
            }
            if (key === 'vmTabColor') {
                showPanel(VM_TAB_PANELS[key]);
            } else {
                hidePanel(el);
            }
        }
        setActiveTab('vmTabColor');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }

    if (typeof window.jQuery !== 'undefined') {
        window.jQuery(document).on('click', '.vm-app-otp-close', function () {
            window.HidePoPup();
        });
        window.jQuery(document).on('click', '.vm-app-overlay', function (ev) {
            if (ev.target === this && this.id !== 'vmOverlayLoad') {
                window.HidePoPup();
            }
        });
    }
})(window, document);
