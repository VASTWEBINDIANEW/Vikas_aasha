/**
 * Public login tabs + password eye.
 * Uses classes (not jQuery .show/.hide) so CSS !important cannot keep Sign In stuck open.
 */
(function () {
    "use strict";

    function byId(id) {
        return document.getElementById(id);
    }

    function setHidden(el, hidden) {
        if (!el) {
            return;
        }
        if (hidden) {
            el.classList.remove("vm-login-panel-active", "resp-tab-content-active");
            el.classList.add("vm-login-panel-hidden");
            if (el.id === "forget") {
                el.classList.add("hidden");
            }
        } else {
            el.classList.add("vm-login-panel-active", "resp-tab-content-active");
            el.classList.remove("vm-login-panel-hidden", "hidden");
        }
    }

    function showPanel(clickedId) {
        var key = clickedId || "singin";
        var signIn = byId("signinform");
        var signUp = byId("signupform");
        var forget = byId("forget");
        var btnIn = byId("singin");
        var btnUp = byId("singup");

        setHidden(signIn, true);
        setHidden(signUp, true);
        setHidden(forget, true);

        if (btnIn) {
            btnIn.classList.remove("resp-tab-active");
            btnIn.setAttribute("aria-selected", "false");
        }
        if (btnUp) {
            btnUp.classList.remove("resp-tab-active");
            btnUp.setAttribute("aria-selected", "false");
        }

        if (key === "singup") {
            setHidden(signUp, false);
            if (btnUp) {
                btnUp.classList.add("resp-tab-active");
                btnUp.setAttribute("aria-selected", "true");
            }
        } else if (key === "forgetpass" || key === "forget") {
            setHidden(forget, false);
        } else {
            setHidden(signIn, false);
            if (btnIn) {
                btnIn.classList.add("resp-tab-active");
                btnIn.setAttribute("aria-selected", "true");
            }
        }
    }

    window.show = function (clickedId) {
        showPanel(clickedId);
        return false;
    };

    function bindTab(btn, panelKey) {
        if (!btn) {
            return;
        }
        btn.setAttribute("type", "button");
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            showPanel(panelKey);
        }, true);
    }

    function initTabs() {
        var root = byId("horizontalTab");
        bindTab(byId("singin"), "singin");
        bindTab(byId("singup"), "singup");

        var initial = "singin";
        if (root && root.getAttribute("data-initial-tab")) {
            initial = root.getAttribute("data-initial-tab");
        }
        if (initial !== "singup" && initial !== "singin") {
            initial = "singin";
        }
        showPanel(initial);
    }

    function initPasswordEye() {
        var eye = byId("vmLoginTogglePass");
        var input = byId("Password");
        if (!eye || !input) {
            return;
        }
        eye.addEventListener("click", function (e) {
            e.preventDefault();
            var icon = eye.querySelector("i");
            if (input.getAttribute("type") === "password") {
                input.setAttribute("type", "text");
                if (icon) {
                    icon.className = "fa fa-eye-slash";
                }
                eye.setAttribute("aria-label", "Hide password");
            } else {
                input.setAttribute("type", "password");
                if (icon) {
                    icon.className = "fa fa-eye";
                }
                eye.setAttribute("aria-label", "Show password");
            }
        });
    }

    function bindOtpContainer(container) {
        if (!container || container.getAttribute("data-vm-otp-bound") === "1") {
            return;
        }
        container.setAttribute("data-vm-otp-bound", "1");

        container.addEventListener("keyup", function (e) {
            var target = e.target;
            var maxLength;
            var myLength;
            var next;
            var previous;

            if (!target || target.tagName.toLowerCase() !== "input") {
                return;
            }

            maxLength = parseInt(target.getAttribute("maxlength"), 10) || 1;
            myLength = target.value.length;

            if (myLength >= maxLength) {
                next = target;
                while ((next = next.nextElementSibling)) {
                    if (next.tagName.toLowerCase() === "input") {
                        next.focus();
                        break;
                    }
                }
            } else if (myLength === 0 && (e.key === "Backspace" || e.keyCode === 8)) {
                previous = target;
                while ((previous = previous.previousElementSibling)) {
                    if (previous.tagName.toLowerCase() === "input") {
                        previous.focus();
                        break;
                    }
                }
            }
        });

        container.querySelectorAll("input").forEach(function (input) {
            input.addEventListener("input", function () {
                this.value = this.value.replace(/\D/g, "").slice(0, 1);
            });
            input.addEventListener("focus", function () {
                var inputs = container.querySelectorAll("input");
                var i;
                for (i = 0; i < inputs.length; i++) {
                    if (inputs[i] === this) {
                        break;
                    }
                    if (!inputs[i].value) {
                        inputs[i].focus();
                        break;
                    }
                }
            });
        });
    }

    function initOtpBoxes() {
        document.querySelectorAll(".vm-login-forget-otp-box, .otp_set, .otp_set_1, .otp_set2").forEach(bindOtpContainer);
    }

    window.vmLoginBindOtpBoxes = initOtpBoxes;

    function boot() {
        initTabs();
        initPasswordEye();
        initOtpBoxes();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
