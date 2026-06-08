/**
 * Wallet-Q purchase reports — SweetAlert confirm + approve modal
 */
(function (window, $) {
    "use strict";

    if (!$) {
        return;
    }

    function purchaseOpenApproveModal(idno, status) {
        $("#id").val(idno);
        $("#type").val(status);
        if ($("#HD_frm_date").length) {
            $("#HD_frm_date").val($("#txt_frm_date").val() || "");
            $("#HD_to_date").val($("#txt_to_date").val() || "");
        }
        $("#purchaseApproveModal").modal("show");
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
                closeOnConfirm: true
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

    window.purchaseModalAjaxSuccess = function () {
        $("#purchaseApproveModal").modal("hide");
    };

    window.purchaseRetailerFilter = function () {
        var q = ($("#myInput").val() || "").toLowerCase();
        $("#purchaseRetailerTable tbody tr").not(".saas-pur-row-total").each(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(q) > -1);
        });
    };
})(window, window.jQuery);
