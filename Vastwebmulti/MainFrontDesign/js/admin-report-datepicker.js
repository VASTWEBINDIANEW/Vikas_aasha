/**
 * Date range picker for AllDetails + PANAadharVerificationReport
 * (bootstrap-datepicker — loaded after layout scripts)
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
        enableOnReadonly: true
    };

    function setActive($input, on) {
        $input.closest(".saas-acc-dp-field").toggleClass("is-active", !!on);
    }

    function bindPicker($input) {
        if (!$input.length || $input.data("datepicker")) {
            return;
        }

        $input.prop("readonly", true);
        $input.datepicker(pickerOpts);

        $input.on("show", function () {
            setActive($input, true);
        });
        $input.on("hide", function () {
            setActive($input, false);
        });
        $input.on("changeDate", function () {
            setActive($input, false);
        });

        $input.on("click", function (e) {
            e.preventDefault();
            $input.datepicker("show");
        });

        $input.siblings(".saas-acc-dp-icon").on("click", function (e) {
            e.preventDefault();
            $input.datepicker("show");
        });
    }

    function initReportDateForm(formSelector) {
        var form = document.querySelector(formSelector);
        if (!form || !window.jQuery || !jQuery.fn.datepicker) {
            return !form;
        }

        var $ = window.jQuery;
        var $form = $(form);
        var $frm = $form.find("#txt_frm_date");
        var $to = $form.find("#txt_to_date");

        if (!$frm.length || !$to.length) {
            return true;
        }

        bindPicker($frm);
        bindPicker($to);

        var mode = ($form.attr("data-date-mode") || "get").toLowerCase();
        var frmVal = $form.attr("data-frm-date") || "";
        var toVal = $form.attr("data-to-date") || "";

        if (mode === "post" || mode === "set" || frmVal || toVal) {
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

        $frm.on("changeDate", function () {
            var from = $frm.datepicker("getDate");
            var to = $to.datepicker("getDate");
            if (from && to && to < from) {
                $to.datepicker("setDate", from);
            }
        });

        $to.on("changeDate", function () {
            var from = $frm.datepicker("getDate");
            var to = $to.datepicker("getDate");
            if (from && to && to < from) {
                $frm.datepicker("setDate", to);
            }
        });

        return true;
    }

    function boot() {
        if (!window.jQuery || !window.jQuery.fn.datepicker) {
            window.setTimeout(boot, 50);
            return;
        }
        initReportDateForm("#allDetailsForm");
        initReportDateForm("#panReportForm");
        initReportDateForm("#rchFailedReportForm");
        initReportDateForm("#microUnholdHistoryForm");
        initReportDateForm("#purchaseReportFormMaster");
        initReportDateForm("#purchaseReportFormDealer");
        initReportDateForm("#purchaseReportFormRetailer");
        initReportDateForm("#purchaseReportFormApi");
        initReportDateForm("#purchaseReportFormWhitelabel");
        initReportDateForm("#disputeReportForm");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    window.initAdminReportDateForm = initReportDateForm;
})(window, document);
