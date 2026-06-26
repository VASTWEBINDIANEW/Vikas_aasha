/**
 * Pay_U_Gateway — date range picker (same behavior as UPICharges / admin-report-datepicker)
 */
(function (window, document) {
    "use strict";

    var pickerOpts = {
        format: "yyyy-mm-dd",
        todayHighlight: true,
        autoclose: true,
        orientation: "bottom auto",
        forceParse: false,
        keyboardNavigation: true,
        enableOnReadonly: true,
        container: "body"
    };

    function setActive($input, on) {
        $input.closest(".saas-acc-dp-field").toggleClass("is-active", !!on);
    }

    function destroyPicker($input) {
        if (!$input || !$input.length || !$input.data("datepicker")) {
            return;
        }
        $input.off(".pgGatewayDate");
        $input.siblings(".saas-acc-dp-icon").off(".pgGatewayDate");
        try {
            $input.datepicker("destroy");
        } catch (e) { /* ignore */ }
    }

    function bindPicker($input) {
        if (!$input || !$input.length || !window.jQuery || !jQuery.fn.datepicker) {
            return false;
        }

        destroyPicker($input);
        $input.prop("readonly", true);
        $input.datepicker(pickerOpts);

        $input.on("show.pgGatewayDate", function () {
            setActive($input, true);
            if (typeof window.repositionAdminDatepickerForMobile === "function") {
                window.repositionAdminDatepickerForMobile();
            }
        });
        $input.on("hide.pgGatewayDate changeDate.pgGatewayDate", function () {
            setActive($input, false);
        });
        $input.on("click.pgGatewayDate", function (e) {
            e.preventDefault();
            e.stopPropagation();
            $input.datepicker("show");
        });
        $input.siblings(".saas-acc-dp-icon").on("click.pgGatewayDate", function (e) {
            e.preventDefault();
            e.stopPropagation();
            $input.datepicker("show");
        });

        return true;
    }

    function initPayUGatewayDateFields() {
        var $ = window.jQuery;
        if (!$ || !$.fn || !$.fn.datepicker) {
            return false;
        }

        var $frm = $("#txt_frm_date1");
        var $to = $("#txt_to_date1");
        if (!$frm.length || !$to.length) {
            return false;
        }

        bindPicker($frm);
        bindPicker($to);

        var $form = $("#payUGatewayForm");
        var mode = (($form.attr("data-date-mode") || "get") + "").toLowerCase();
        var frmVal = $form.attr("data-frm-date") || "";
        var toVal = $form.attr("data-to-date") || "";

        if (mode === "post" || frmVal || toVal) {
            if (frmVal) {
                $frm.datepicker("update", frmVal);
            } else {
                $frm.datepicker("setDate", new Date());
            }
            if (toVal) {
                $to.datepicker("update", toVal);
            } else {
                $to.datepicker("setDate", new Date());
            }
        } else {
            $frm.datepicker("setDate", new Date());
            $to.datepicker("setDate", new Date());
        }

        $frm.off("changeDate.pgGatewayRange").on("changeDate.pgGatewayRange", function () {
            var from = $frm.datepicker("getDate");
            var to = $to.datepicker("getDate");
            if (from && to && to < from) {
                $to.datepicker("setDate", from);
            }
        });

        $to.off("changeDate.pgGatewayRange").on("changeDate.pgGatewayRange", function () {
            var from = $frm.datepicker("getDate");
            var to = $to.datepicker("getDate");
            if (from && to && to < from) {
                $frm.datepicker("setDate", to);
            }
        });

        window.payUGatewayDatesReady = true;
        return true;
    }

    function bootPayUGatewayDates(attempt) {
        attempt = attempt || 0;
        if (initPayUGatewayDateFields()) {
            return;
        }
        if (attempt < 200) {
            window.setTimeout(function () {
                bootPayUGatewayDates(attempt + 1);
            }, 50);
        }
    }

    function schedulePayUGatewayDateBoot() {
        bootPayUGatewayDates(0);
    }

    if (document.readyState === "complete") {
        schedulePayUGatewayDateBoot();
    } else {
        window.addEventListener("load", schedulePayUGatewayDateBoot);
    }

    document.addEventListener("DOMContentLoaded", function () {
        window.setTimeout(schedulePayUGatewayDateBoot, 0);
    });

    window.initPayUGatewayDateFields = initPayUGatewayDateFields;
    window.bootPayUGatewayDates = bootPayUGatewayDates;
})(window, document);
