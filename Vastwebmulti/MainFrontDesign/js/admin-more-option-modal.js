/**
 * More Option page — reliable modal open/close (BS3 + admin-modal-fix)
 */
(function ($, window, document) {
    "use strict";

    if (!$ || !$.fn.modal || !$("#more-option-page").length) {
        return;
    }

    var MODAL = ".saas-more-option-modal";

    function moveModalsToBody() {
        $(MODAL).each(function () {
            var $m = $(this);
            if ($m.parent().length && !$m.parent().is("body")) {
                $m.appendTo(document.body);
            }
        });
    }

    function initModals() {
        $(MODAL).each(function () {
            var $m = $(this);
            if (!$m.data("bs.modal")) {
                $m.modal({
                    show: false,
                    backdrop: true,
                    keyboard: true
                });
            }
        });
    }

    function openModal(selector) {
        var $modal = $(selector);
        if (!$modal.length || !$modal.is(MODAL)) {
            return;
        }

        if (typeof window.showAdminModal === "function") {
            window.showAdminModal(selector);
            return;
        }

        moveModalsToBody();
        initModals();
        $modal.modal("show");
    }

    function getModalTarget($el) {
        var target = $el.attr("data-target") || $el.attr("data-mo-target");
        if (!target || target.charAt(0) !== "#") {
            return null;
        }
        return target;
    }

    function isMoreOptionTrigger($el) {
        var target = getModalTarget($el);
        return target && $(target).is(MODAL);
    }

    $(function () {
        moveModalsToBody();
        initModals();
    });

    /* Grid cards + buttons inside modals (e.g. _Manualform Add, Change link name) */
    $(document).on(
        "click",
        "#more-option-page [data-target], " + MODAL + " [data-target]",
        function (e) {
            var $btn = $(this);
            if (!isMoreOptionTrigger($btn)) {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            var target = getModalTarget($btn);

            if (target === "#myModalnew" && typeof window.travel_hideshow === "function") {
                window.travel_hideshow();
            }

            openModal(target);
        }
    );

    $(document).on("shown.bs.modal", MODAL, function () {
        var $self = $(this);
        var stack = $(MODAL).filter(".in, .show").length;
        var modalZ = 11050 + Math.max(0, stack - 1) * 20;

        $self.css("z-index", modalZ);
        $(".modal-backdrop").last().css("z-index", modalZ - 10);
    });

})(window.jQuery, window, document);
