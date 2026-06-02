(function ($, window, document) {
    "use strict";

    if (!$ || !$.fn.modal || !$.fn.modal.Constructor) {
        return;
    }

    var Modal = $.fn.modal.Constructor;
    var _hideModal = Modal.prototype.hideModal;

    function isAdminUi() {
        return document.body && document.body.classList.contains("saas-admin-ui");
    }

    function getOpenModals() {
        return $("body.saas-admin-ui .modal").filter(function () {
            var $m = $(this);
            return $m.hasClass("in") || $m.hasClass("show") || $m.css("display") === "block";
        });
    }

    function prepareModal($modal) {
        if (!$modal || !$modal.length) {
            return;
        }

        if ($modal.parent().length && !$modal.parent().is("body")) {
            $modal.appendTo(document.body);
        }

        $modal.removeClass("collapsing");

        var inlineStyle = $modal.attr("style") || "";
        if (/display\s*:\s*none/i.test(inlineStyle)) {
            $modal.removeAttr("style");
        }
    }

    function openModal($modal) {
        $modal.addClass("in show").css({
            display: "block",
            opacity: 1,
            visibility: "visible",
            paddingRight: ""
        }).attr("aria-hidden", "false");

        $(".modal-backdrop").last().addClass("in show").css({
            display: "block",
            opacity: 0.5
        });
    }

    function closeModal($modal) {
        $modal.removeClass("in show").css({
            display: "none",
            opacity: "",
            visibility: ""
        }).attr("aria-hidden", "true");
    }

    function cleanupModalArtifacts() {
        if (getOpenModals().length > 0) {
            return;
        }

        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open").css({
            overflow: "",
            "padding-right": ""
        });
    }

    function initModalInstance($modal) {
        if (!$modal.data("bs.modal")) {
            $modal.modal({
                show: false,
                backdrop: true,
                keyboard: true
            });
        }
    }

    /* Ensure BS3 hide removes BS5 .show class */
    Modal.prototype.hideModal = function () {
        if (isAdminUi()) {
            closeModal(this.$element);
        }

        _hideModal.apply(this, arguments);

        if (isAdminUi()) {
            window.setTimeout(cleanupModalArtifacts, Modal.BACKDROP_TRANSITION_DURATION + 20);
        }
    };

    window.showAdminModal = function (selector) {
        var $modal = $(selector);
        if (!$modal.length) {
            return;
        }

        prepareModal($modal);
        initModalInstance($modal);
        $modal.modal("show");
    };

    window.hideAdminModal = function (selector) {
        var $modal = $(selector);
        if (!$modal.length) {
            return;
        }

        $modal.modal("hide");
    };

    $(document).on("show.bs.modal", ".modal", function () {
        if (!isAdminUi()) {
            return;
        }

        prepareModal($(this));

        if (window.closeAdminSidebar) {
            window.closeAdminSidebar();
        }
        if (window.closeAdminTopMenu) {
            window.closeAdminTopMenu();
        }
    });

    function syncBackdropBelowModal($modal) {
        var modalZ = parseInt($modal.css("z-index"), 10);

        if (isNaN(modalZ) || modalZ < 11000) {
            modalZ = 11000;
            if ($modal.hasClass("saas-more-option-modal") || $modal.hasClass("saas-settings-otp-modal")) {
                modalZ = 11050;
            }
            $modal.css("z-index", modalZ);
        }

        $(".modal-backdrop").last().css("z-index", modalZ - 10);
    }

    $(document).on("shown.bs.modal", ".modal", function () {
        if (!isAdminUi()) {
            return;
        }

        var $modal = $(this);
        openModal($modal);
        syncBackdropBelowModal($modal);
    });

    $(document).on("hide.bs.modal", ".modal", function () {
        if (!isAdminUi()) {
            return;
        }

        $(this).removeClass("show");
    });

    $(document).on("hidden.bs.modal", ".modal", function () {
        if (!isAdminUi()) {
            return;
        }

        closeModal($(this));
        cleanupModalArtifacts();
    });

    $(document).on("click", "[data-dismiss='modal'], [data-bs-dismiss='modal']", function (e) {
        if (!isAdminUi()) {
            return;
        }

        var $modal = $(this).closest(".modal");
        if ($modal.length) {
            e.preventDefault();
            $modal.modal("hide");
        }
    });

    $(document).on("keydown", function (e) {
        if (!isAdminUi() || e.key !== "Escape") {
            return;
        }

        getOpenModals().each(function () {
            $(this).modal("hide");
        });
    });

    $(function () {
        if (!isAdminUi()) {
            return;
        }

        $("body.saas-admin-ui .modal").each(function () {
            var $m = $(this);
            initModalInstance($m);

            if (!$m.hasClass("in") && !$m.hasClass("show")) {
                closeModal($m);
            } else if ($m.css("display") === "none") {
                $m.removeClass("in show");
                closeModal($m);
            }
        });

        cleanupModalArtifacts();
    });
})(window.jQuery, window, document);
