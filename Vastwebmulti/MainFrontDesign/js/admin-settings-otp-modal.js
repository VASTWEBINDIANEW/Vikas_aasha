/**
 * OTP modals for webappsetting + user_no_setting (BS3 + admin-modal-fix)
 */
(function ($, window, document) {
    "use strict";

    if (!$ || !$.fn.modal) {
        return;
    }

    var OTP_MODALS = "#userNoOtpModal, #webappOtpModal";

    function prepareOtpModal($modal) {
        if (!$modal || !$modal.length) {
            return;
        }

        if ($modal.parent().length && !$modal.parent().is("body")) {
            $modal.appendTo(document.body);
        }

        $modal.removeClass("collapsing");

        if (!$modal.data("bs.modal")) {
            $modal.modal({
                show: false,
                backdrop: true,
                keyboard: true
            });
        }
    }

    function setOtpModalMessage($modal, text, isError) {
        var $msg = $modal.find("#tstsmessage");
        $msg.toggleClass("is-error", !!isError).text(text);
    }

    /** Open immediately; OTP API runs in parallel (no wait before show). */
    function openOtpModalFast(selector, pendingText) {
        var $modal = $(selector);
        if (!$modal.length) {
            return;
        }

        prepareOtpModal($modal);
        $modal.find("#tops").val("").prop("disabled", false);
        setOtpModalMessage($modal, pendingText || "Sending OTP…", false);

        if (typeof window.showAdminModal === "function") {
            window.showAdminModal(selector);
        } else {
            $modal.modal("show");
        }
    }

    function sendOtpInBackground(sendUrl, $modal, onDone) {
        $.ajax({
            url: sendUrl,
            type: "POST",
            timeout: 15000,
            success: function () {
                setOtpModalMessage($modal, "OTP sent successfully.", false);
                if (onDone) {
                    onDone(true);
                }
            },
            error: function () {
                setOtpModalMessage(
                    $modal,
                    "Could not send OTP. Enter the last OTP if you already received one.",
                    true
                );
                if (onDone) {
                    onDone(false);
                }
            }
        });
    }

    function openOtpModal(selector) {
        openOtpModalFast(selector, "OTP sent successfully.");
    }

    function closeOtpModal(selector) {
        var $modal = $(selector);
        if (!$modal.length) {
            return;
        }

        if (typeof window.hideAdminModal === "function") {
            window.hideAdminModal(selector);
            return;
        }

        $modal.modal("hide");
    }

    function syncOtpModalZIndex($modal) {
        $modal.css("z-index", 11055);
        $(".modal-backdrop").last().css("z-index", 11045);
    }

    $(function () {
        $(OTP_MODALS).each(function () {
            prepareOtpModal($(this));
        });
    });

    $(document).on("show.bs.modal", OTP_MODALS, function () {
        prepareOtpModal($(this));
    });

    $(document).on("shown.bs.modal", OTP_MODALS, function () {
        var $modal = $(this);
        syncOtpModalZIndex($modal);
        window.setTimeout(function () {
            $modal.find("#tops").trigger("focus");
        }, 0);
    });

    /* ── User Mobile No. Status ── */
    var $userPage = $("#user-no-setting-page");

    if ($userPage.length) {
        var otpSendUrl = $userPage.data("otp-url");
        var saveUrl = $userPage.data("save-url");
        var state = {};

        function renderUserNoToggle(rowIndex, userId, isOn) {
            var cell = document.querySelector(
                '.num-status-cell[data-row-index="' + rowIndex + '"]'
            );
            if (!cell) {
                return;
            }

            var stsOff = "true";
            var stsOn = "false";
            var pillClass = isOn ? "saas-set-pill--on" : "saas-set-pill--off";
            var label = isOn ? "ON" : "OFF";
            var nextSts = isOn ? stsOn : stsOff;

            cell.innerHTML =
                '<button type="button" class="saas-set-pill ' +
                pillClass +
                ' user-no-toggle" data-userid="' +
                userId +
                '" data-row-index="' +
                rowIndex +
                '" data-sts="' +
                nextSts +
                '">' +
                label +
                "</button>";
        }

        $(document).on("click", "#user-no-setting-page .user-no-toggle", function (e) {
            e.preventDefault();

            var $btn = $(this);
            state = {
                id: String($btn.attr("data-userid") || ""),
                rowIndex: parseInt($btn.attr("data-row-index"), 10),
                sts: String($btn.attr("data-sts")) === "true"
            };

            var $modal = $("#userNoOtpModal");
            openOtpModalFast("#userNoOtpModal", "Sending OTP…");
            sendOtpInBackground(otpSendUrl, $modal);
        });

        $(document).on("click", "#userNoSaveBtn", function () {
            var otp = String($("#userNoOtpModal #tops").val() || "").trim();

            if (otp.length < 3) {
                $("#userNoOtpModal #tstsmessage")
                    .addClass("is-error")
                    .text("Enter the OTP (3–4 digits).");
                return;
            }

            $.ajax({
                url: saveUrl,
                type: "POST",
                data: { userid: state.id, sts: state.sts, otp: otp },
                success: function (data) {
                    var ok = data && (data.status1 === true || data.status1 === "true" || data.Status1 === true);
                    if (ok) {
                        var isOn = data.status === true || data.status === "true" || data.Status === true;
                        renderUserNoToggle(state.rowIndex, state.id, isOn);
                        closeOtpModal("#userNoOtpModal");
                        if (typeof swal === "function") {
                            swal("Updated", "Mobile number status saved.", "success");
                        }
                    } else {
                        $("#userNoOtpModal #tstsmessage")
                            .addClass("is-error")
                            .text("OTP did not match. Please try again.");
                    }
                },
                error: function () {
                    $("#userNoOtpModal #tstsmessage")
                        .addClass("is-error")
                        .text("Could not save. Please try again.");
                }
            });
        });
    }

    /* ── Retailer Login Status (webappsetting) ── */
    var $webPage = $("#webapp-setting-page");

    if ($webPage.length) {
        var webOtpUrl = $webPage.data("otp-url");
        var webState = {};

        function renderWebToggle(type, rowIndex, userId, isOn) {
            var selector = type === "Web" ? ".websss" : ".appsss";
            var cell = document.querySelector(
                selector + '[data-row-index="' + rowIndex + '"]'
            );
            if (!cell) {
                return;
            }

            var pillClass = isOn ? "saas-set-pill--on" : "saas-set-pill--off";
            var label = isOn ? "ON" : "OFF";
            var nextSts = isOn ? "false" : "true";

            cell.innerHTML =
                '<button type="button" class="saas-set-pill ' +
                pillClass +
                ' web-login-toggle" data-type="' +
                type +
                '" data-userid="' +
                userId +
                '" data-row-index="' +
                rowIndex +
                '" data-sts="' +
                nextSts +
                '">' +
                label +
                "</button>";
        }

        $(document).on("click", "#webapp-setting-page .web-login-toggle", function (e) {
            e.preventDefault();

            var $btn = $(this);
            webState = {
                type: $btn.attr("data-type"),
                id: String($btn.attr("data-userid") || ""),
                rowIndex: parseInt($btn.attr("data-row-index"), 10),
                sts: String($btn.attr("data-sts")) === "true"
            };

            var $modal = $("#webappOtpModal");
            openOtpModalFast("#webappOtpModal", "Sending OTP…");
            sendOtpInBackground(webOtpUrl, $modal);
        });

        $(document).on("click", "#webappSaveBtn", function () {
            var otp = String($("#webappOtpModal #tops").val() || "").trim();
            if (otp.length < 3) {
                $("#webappOtpModal #tstsmessage").addClass("is-error").text("Enter the OTP (3–4 digits).");
                return;
            }

            var url =
                webState.type === "Web"
                    ? $webPage.data("web-save-url")
                    : $webPage.data("app-save-url");

            $.ajax({
                url: url,
                type: "POST",
                data: { userid: webState.id, sts: webState.sts, otp: otp },
                success: function (data) {
                    var ok = data && (data.status1 === true || data.status1 === "true" || data.Status1 === true);
                    if (ok) {
                        var isOn = data.status === true || data.status === "true";
                        renderWebToggle(webState.type, webState.rowIndex, webState.id, isOn);
                        closeOtpModal("#webappOtpModal");
                        if (typeof swal === "function") {
                            swal("Updated", "Login status saved.", "success");
                        }
                    } else {
                        $("#webappOtpModal #tstsmessage").addClass("is-error").text("OTP did not match.");
                    }
                },
                error: function () {
                    $("#webappOtpModal #tstsmessage").addClass("is-error").text("Could not save.");
                }
            });
        });
    }

    window.openAdminOtpModal = openOtpModal;
    window.closeAdminOtpModal = closeOtpModal;
})(window.jQuery, window, document);
