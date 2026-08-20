/**
 * Retailer bank (User A/C Q) — approve OTP modal, reject/delete confirm
 * Loaded after layout jQuery, Bootstrap modal + SweetAlert (see RetailerBnk.cshtml).
 */
(function (window, document) {
    "use strict";

    function jq() {
        return window.jQuery;
    }

    function showModal(selector) {
        var $ = jq();
        if (!$) {
            return false;
        }

        var $modal = $(selector);
        if (!$modal.length) {
            return false;
        }

        if (typeof window.showAdminModal === "function") {
            window.showAdminModal(selector);
            return true;
        }

        if ($.fn.modal) {
            $modal.modal("show");
            return true;
        }

        $modal
            .removeClass("collapsing")
            .addClass("in show")
            .css({ display: "block", opacity: 1, visibility: "visible" })
            .attr("aria-hidden", "false");

        if (!$(".modal-backdrop").length) {
            $("<div class=\"modal-backdrop fade in show\"></div>").appendTo(document.body);
        }

        $("body").addClass("modal-open");
        return true;
    }

    function hideModal(selector) {
        var $ = jq();
        if (!$) {
            return;
        }

        var $modal = $(selector);
        if (!$modal.length) {
            return;
        }

        if (typeof window.hideAdminModal === "function") {
            window.hideAdminModal(selector);
            return;
        }

        if ($.fn.modal) {
            $modal.modal("hide");
            return;
        }

        $modal.removeClass("in show").css({ display: "none" }).attr("aria-hidden", "true");
        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open");
    }

    function openApproveModal(idno, userid, firmName, holderName, bankNo, ifsc, imgSrc) {
        var $ = jq();
        if (!$) {
            window.alert("Page is still loading. Please try again.");
            return;
        }

        $("#hdidno").val(idno || "");
        $("#hduserid").val(userid || "");
        $("#txtaccountholdername").val(holderName || "");
        $("#txtifsccode").val(ifsc || "");
        $("#txtaccountnumber").val(bankNo || "");
        $("#retailerBankApproveTitle").html("<i class=\"fas fa-university\" aria-hidden=\"true\"></i> " + (firmName || "Approve bank"));
        $("#imgcheck").attr("src", imgSrc || "").toggle(!!imgSrc);
        $("#remotp, #adminotp").val("");
        $("#retailerBankOtpMsg").removeClass("is-error").text("OTP sent to retailer and admin email.");

        if (!showModal("#retailerBankApproveModal")) {
            window.alert("Could not open OTP popup. Please refresh the page.");
        }

        window.setTimeout(function () {
            $("#remotp").trigger("focus");
        }, 350);
    }

    function otpSucceeded(data) {
        if (data === "DONE") {
            return true;
        }
        if (data && typeof data === "object" && data.result === "DONE") {
            return true;
        }
        return String(data || "").replace(/"/g, "").toUpperCase() === "DONE";
    }

    function getOtpUrl() {
        var url = window.retailerBankOtpUrl || "";
        if (!url) {
            var host = document.querySelector(".saas-bank-page");
            url = host ? (host.getAttribute("data-retailer-bank-otp-url") || "") : "";
        }
        return url;
    }

    window.retailerBankSendOtp = function (userid, idno, firmName, holderName, bankNo, ifsc) {
        var $ = jq();
        if (!$) {
            window.alert("Page is still loading. Please try again.");
            return false;
        }

        var imgSrc = $("#upload-" + idno).attr("src") || "";
        var url = getOtpUrl();

        if (!url) {
            if (typeof window.swal === "function") {
                window.swal("Error", "OTP URL is not configured.", "error");
            } else {
                window.alert("OTP URL is not configured.");
            }
            return false;
        }

        $("#retailerBankOtpMsg").removeClass("is-error").text("Sending OTP...");

        $.ajax({
            type: "GET",
            url: url,
            cache: false,
            dataType: "json",
            data: { userid: userid },
            async: true
        }).done(function (data) {
            if (otpSucceeded(data)) {
                openApproveModal(idno, userid, firmName, holderName, bankNo, ifsc, imgSrc);
            } else {
                $("#retailerBankOtpMsg").addClass("is-error").text(String(data || "Could not send OTP"));
                if (typeof window.swal === "function") {
                    window.swal("Error", String(data || "Could not send OTP"), "error");
                } else {
                    window.alert(String(data || "Could not send OTP"));
                }
            }
        }).fail(function () {
            $("#retailerBankOtpMsg").addClass("is-error").text("Failed to send OTP. Try again.");
            if (typeof window.swal === "function") {
                window.swal("Error", "Failed to send OTP. Try again.", "error");
            } else {
                window.alert("Failed to send OTP. Try again.");
            }
        });

        return false;
    };

    window.retailerBankConfirmReject = function (url) {
        if (!url) {
            return false;
        }

        var go = function () {
            window.location.href = url;
        };

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
                    go();
                }
            });
        } else if (window.confirm("Reject this bank request?")) {
            go();
        }

        return false;
    };

    window.retailerBankConfirmDelete = function (url) {
        if (!url) {
            return false;
        }

        var go = function () {
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
                    go();
                }
            });
        } else if (window.confirm("Delete this approved bank?")) {
            go();
        }

        return false;
    };

    window.retailerBankShowImage = function (idno) {
        var $ = jq();
        if (!$) {
            return false;
        }

        var src = $("#upload-" + idno).attr("src");
        if (!src) {
            return false;
        }

        $("#retailerBankImageFull").attr("src", src);
        showModal("#retailerBankImageModal");
        return false;
    };

    function bindRetailerBankEvents() {
        var $ = jq();
        if (!$) {
            return;
        }

        $(document)
            .off("click.retailerBank", ".saas-bank-approve-btn")
            .on("click.retailerBank", ".saas-bank-approve-btn", function (e) {
                if (this.getAttribute("onclick")) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var $b = $(this);
                window.retailerBankSendOtp(
                    $b.data("userid"),
                    $b.data("idno"),
                    $b.data("firm"),
                    $b.data("holder"),
                    $b.data("bankno"),
                    $b.data("ifsc")
                );
            });

        $(document)
            .off("click.retailerBank", ".saas-bank-delete-reveal")
            .on("click.retailerBank", ".saas-bank-delete-reveal", function (e) {
                e.preventDefault();
                $(this).hide();
                $(this).siblings(".saas-bank-delete-confirm").show();
            });

        $(document)
            .off("click.retailerBankClose", "#retailerBankApproveModal [data-dismiss='modal']")
            .on("click.retailerBankClose", "#retailerBankApproveModal [data-dismiss='modal']", function (e) {
                e.preventDefault();
                hideModal("#retailerBankApproveModal");
            });
    }

    window.initRetailerBankPage = function () {
        bindRetailerBankEvents();
    };
})(window, document);
