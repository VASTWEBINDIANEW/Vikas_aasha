/**
 * Wallet-Q purchase reports — confirm + approve modal (matches legacy funin flow)
 */
(function (window, $) {
    "use strict";

    if (!$) {
        return;
    }

    function purchaseCleanupSwal() {
        if (typeof window.swal === "function" && typeof window.swal.close === "function") {
            try {
                window.swal.close();
            } catch (e) { }
        }
        $(".sweet-overlay, .sweet-alert").hide().removeClass("visible showSweetAlert hideSweetAlert");
        $("body").removeClass("stop-scrolling");
    }

    function purchaseShowModal() {
        var $modal = $("#purchaseApproveModal");
        if (!$modal.length) {
            return false;
        }

        purchaseCleanupSwal();

        if (typeof window.showAdminModal === "function") {
            window.showAdminModal("#purchaseApproveModal");
            return true;
        }

        if ($.fn.modal) {
            $modal.modal("show");
            return true;
        }

        return false;
    }

    function purchaseOpenApproveModal(idno, status) {
        var $modal = $("#purchaseApproveModal");
        if (!$modal.length) {
            if (window.confirm("ARE YOU SURE?")) {
                return;
            }
            return;
        }

        $("#id").val(idno || "");
        $("#type").val(status || "");
        $("#txthighsec").val("");
        $("#txtcomment").val("");
        $("#errormsgshow").text("");

        if ($("#HD_frm_date").length) {
            $("#HD_frm_date").val($("#txt_frm_date").val() || "");
            $("#HD_to_date").val($("#txt_to_date").val() || "");
        }

        window.setTimeout(function () {
            if (!purchaseShowModal()) {
                window.alert("Unable to open approve dialog. Please refresh the page and try again.");
            }
        }, 300);
    }

    window.purchaseFunin = function (idno, status) {
        var isApprove = status === "APP";
        var title = isApprove ? "Approve purchase order?" : "Reject purchase order?";
        var text = isApprove
            ? "This will approve the pending purchase request."
            : "This will reject the pending purchase request.";

        if (typeof window.swal === "function") {
            window.swal({
                title: title,
                text: text,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: isApprove ? "#059669" : "#dc2626",
                confirmButtonText: isApprove ? "Yes, approve" : "Yes, reject",
                cancelButtonText: "Cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    purchaseOpenApproveModal(idno, status);
                }
            });
        } else if (window.confirm("ARE YOU SURE?")) {
            purchaseOpenApproveModal(idno, status);
        }

        return false;
    };

    window.funin = window.purchaseFunin;

    window.purchaseRetailerFilter = function () {
        var q = ($("#myInput").val() || "").toLowerCase();
        $("#purchaseRetailerTable tbody tr").not(".saas-pur-row-total").each(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(q) > -1);
        });
    };

    $(document).on("submit", "#purchaseApproveForm", function () {
        var $btn = $(this).find('button[type="submit"], input[type="submit"]');
        $btn.prop("disabled", true);
    });
})(window, window.jQuery);
