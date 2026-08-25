(function ($) {
    "use strict";

    function setActiveTab(tabId) {
        $("#singin, #singup").removeClass("resp-tab-active");
        if (tabId === "singin") {
            $("#singin").addClass("resp-tab-active");
        } else if (tabId === "singup") {
            $("#singup").addClass("resp-tab-active");
        }
    }

    function showPanel(clickedId) {
        var $signIn = $("#signinform");
        var $signUp = $("#signupform");
        var $forget = $("#forget");

        if (clickedId === "singin") {
            setActiveTab("singin");
            $signIn.show();
            $signUp.hide();
            $forget.hide().addClass("hidden");
        } else if (clickedId === "singup") {
            setActiveTab("singup");
            $signIn.hide();
            $signUp.show();
            $forget.hide().addClass("hidden");
        } else {
            $signIn.hide();
            $signUp.hide();
            $forget.removeClass("hidden").show();
        }
    }

    window.show = showPanel;

    function initPublicLoginTabs() {
        if (!$ || !$.fn || !$.fn.easyResponsiveTabs) {
            return;
        }

        var $tabRoot = $("#horizontalTab");
        if ($tabRoot.length && !$tabRoot.data("vmLoginTabsInit")) {
            $tabRoot.easyResponsiveTabs({
                type: "default",
                width: "auto",
                fit: true
            });
            $tabRoot.data("vmLoginTabsInit", true);
        }

        $("#singin").off("click.vmLoginTab").on("click.vmLoginTab", function () {
            showPanel("singin");
        });

        $("#singup").off("click.vmLoginTab").on("click.vmLoginTab", function () {
            showPanel("singup");
        });
    }

    $(function () {
        initPublicLoginTabs();
    });
})(window.jQuery);
