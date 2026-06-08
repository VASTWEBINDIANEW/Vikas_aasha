/**
 * Retailer bank (User A/C Q) — SweetAlert + approve modal
 */
(function (window, $) {
    "use strict";

    if (!$) {
        return;
    }

    function openApproveModal(idno, userid, firmName, holderName, bankNo, ifsc, imgSrc) {
        $("#hdidno").val(idno || "");
        $("#hduserid").val(userid || "");
        $("#txtaccountholdername").val(holderName || "");
        $("#txtifsccode").val(ifsc || "");
        $("#txtaccountnumber").val(bankNo || "");
        $("#retailerBankApproveTitle").text(firmName || "Approve bank");
        $("#imgcheck").attr("src", imgSrc || "");
        $("#remotp, #adminotp").val("");
        $("#retailerBankApproveModal").modal("show");
    }

    window.retailerBankSendOtp = function (userid, idno, firmName, holderName, bankNo, ifsc) {
        var imgSrc = $("#upload-" + idno).attr("src") || "";

        $.ajax({
            type: "GET",
            url: window.retailerBankOtpUrl || "",
            cache: false,
            dataType: "json",
            data: { userid: userid },
            async: true
        }).done(function (data) {
            if (data === "DONE") {
                openApproveModal(idno, userid, firmName, holderName, bankNo, ifsc, imgSrc);
            } else if (typeof window.swal === "function") {
                window.swal("Error", String(data || "Could not send OTP"), "error");
            } else {
                window.alert(String(data || "Could not send OTP"));
            }
        }).fail(function () {
            if (typeof window.swal === "function") {
                window.swal("Error", "Failed to send OTP. Try again.", "error");
            }
        });
    };

    window.retailerBankConfirmReject = function (url) {
        if (!url) {
            return false;
        }
        if (typeof window.swal === "function") {
            window.swal({
                title: "Reject bank request?",
                text: "This will remove the pending bank change request.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                confirmButtonText: "Yes, reject",
                cancelButtonText: "Cancel",
                closeOnConfirm: true
            }, function (isConfirm) {
                if (isConfirm) {
                    window.location.href = url;
                }
            });
        } else if (window.confirm("Reject this bank request?")) {
            window.location.href = url;
        }
        return false;
    };

    window.retailerBankConfirmDelete = function (url, el) {
        if (!url) {
            return false;
        }
        var run = function () {
            window.location.href = url;
        };
        if (typeof window.swal === "function") {
            window.swal({
                title: "Delete approved bank?",
                text: "This removes the approved bank record from the retailer.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
                closeOnConfirm: true
            }, function (isConfirm) {
                if (isConfirm) {
                    run();
                }
            });
        } else if (window.confirm("Delete this approved bank?")) {
            run();
        }
        return false;
    };

    window.retailerBankShowImage = function (idno) {
        var src = $("#upload-" + idno).attr("src");
        if (src) {
            $("#retailerBankImageFull").attr("src", src);
            $("#retailerBankImageModal").modal("show");
        }
    };

    $(function () {
        $(document).on("click", ".saas-bank-delete-reveal", function (e) {
            e.preventDefault();
            $(this).hide();
            $(this).siblings(".saas-bank-delete-confirm").show();
        });
    });
})(window, window.jQuery);
