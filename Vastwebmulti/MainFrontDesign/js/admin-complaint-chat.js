/**
 * Admin complaint chat — mobile user list toggle + reply validation
 */
(function (window, $) {
    "use strict";

    if (!$) {
        return;
    }

    window.complaintSelectUser = function (userid) {
        if (window.matchMedia && window.matchMedia("(max-width: 991px)").matches) {
            $("#saasComplaintUsersCard").addClass("is-collapsed");
        }
        var url = (window.complaintPageUrl || "") + "?type=User&userid=" + encodeURIComponent(userid);
        window.location.href = url;
    };

    window.complaintSubmitReply = function (idno, userid) {
        var input = document.getElementById(String(idno));
        var comment = input ? input.value.trim() : "";
        if (!comment) {
            if (typeof window.swal === "function") {
                window.swal("Reply required", "Please enter a message before sending.", "warning");
            }
            return false;
        }
        var base = window.complaintEditUrl || "";
        window.location.href = base + "?type=User&useridd=" + encodeURIComponent(userid) +
            "&id=" + encodeURIComponent(idno) + "&response=" + encodeURIComponent(comment);
        return false;
    };

    $(function () {
        var path = (window.location.pathname || "").toLowerCase();
        var qs = window.location.search || "";
        var activeUser = "";
        var m = qs.match(/userid=([^&]+)/i);
        if (m) {
            activeUser = decodeURIComponent(m[1]);
        }

        $(".saas-complaint-user-item").each(function () {
            var uid = $(this).attr("data-userid") || "";
            if (activeUser && uid === activeUser) {
                $(this).addClass("is-active");
            }
        });

        $("#saasComplaintToggleUsers").on("click", function () {
            $("#saasComplaintUsersCard").toggleClass("is-collapsed");
        });
    });
})(window, window.jQuery);
