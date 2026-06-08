/**
 * Website Renewal modal (#dayleft) — panel navigation helpers + UI
 */
(function ($) {
    'use strict';

    if (!$ || !$('#dayleft').length) return;

    var $modal = $('#dayleft');
    var PANEL_IDS = [
        'scan_show', 'website_show', 'ssl_show', 'Appssl_show', 'Email_show',
        'Sms_show', 'whatsapp_show', 'Upi_show', 'White_show', 'Mpos_show', 'Microatm_show'
    ];

    var panelTabIndex = {
        scan_show: 0,
        website_show: 1,
        ssl_show: 2,
        Appssl_show: 3,
        Email_show: 4,
        Sms_show: 5,
        whatsapp_show: 6,
        Upi_show: 7,
        White_show: 8,
        Mpos_show: 9,
        Microatm_show: 10
    };

    function $visiblePane() {
        return $modal.find('.saas-renewal-panels > [id$="_show"]:visible').first();
    }

    /** Hide every service panel */
    function hideAllPanels() {
        PANEL_IDS.forEach(function (id) {
            $('#' + id).hide();
        });
    }

    /** Restore plan/forms inside modal; hide checkout & payment states */
    function resetPaneUi() {
        $modal.find('.first-form, .second-form, .third-form').show();
        $modal.find('.saas-renewal-checkout, .first-form-button, .second-form-button, .third-form-button, .second-form-button-new').hide();
        $modal.find('.payment-sucess, .payment-faild').hide();
        $modal.find('.comfirsmclasscss').css('display', '');
        $modal.find('.is-selected').removeClass('is-selected');
    }

    /** Call before showing a tab panel */
    function prepareTabSwitch() {
        hideAllPanels();
        resetPaneUi();
    }

    function hideFormInPane(paneId) {
        var $p = $('#' + paneId);
        if (!$p.length) return;
        $p.children('.first-form, .second-form, .third-form').hide();
    }

    function showFormInPane(paneId) {
        var $p = $('#' + paneId);
        if (!$p.length) return;
        $p.children('.first-form, .second-form, .third-form').show();
    }

    function hideFormInVisiblePane() {
        var $pane = $visiblePane();
        if ($pane.length) {
            $pane.children('.first-form, .second-form, .third-form').hide();
        }
    }

    function showFormInVisiblePane() {
        var $pane = $visiblePane();
        if ($pane.length) {
            $pane.children('.first-form, .second-form, .third-form').show();
        }
    }

    function setActiveTab($btn) {
        $modal.find('.saas-renewal-tab').removeClass('active');
        $btn.addClass('active');
        var el = $btn[0];
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function syncTabFromVisiblePanel() {
        var $visible = $visiblePane();
        if (!$visible.length) return;
        var panelId = $visible.attr('id');
        var idx = panelTabIndex[panelId];
        var $tabs = $modal.find('.saas-renewal-tab');
        if (idx !== undefined && $tabs.length > idx) {
            setActiveTab($tabs.eq(idx));
        }
    }

    function markPlanSelected($btn) {
        var $card = $btn.closest('.form-bot-inner, .form-bot-inner-second, .form-bot-inner-third, .saas-renewal-plan-card');
        $modal.find('.is-selected').removeClass('is-selected');
        if ($card.length) $card.addClass('is-selected');
    }

    function patchLegacyShowFunctions() {
        var fns = [
            'scannpay', 'showdayleftinfo', 'ssldatashow', 'emailShow', 'smsShow',
            'whatsappShow', 'upiShow', 'whiteShow', 'mposShow', 'microatmShow'
        ];
        fns.forEach(function (name) {
            var original = window[name];
            if (typeof original !== 'function' || original._saasRenewalWrapped) return;
            var wrapped = function () {
                prepareTabSwitch();
                return original.apply(this, arguments);
            };
            wrapped._saasRenewalWrapped = true;
            window[name] = wrapped;
        });
    }

    /* Patch tab functions after inline handlers in _Layout are defined */
    $(function () {
        patchLegacyShowFunctions();
    });

    window.saasRenewalHideAllPanels = hideAllPanels;
    window.saasRenewalResetPaneUi = resetPaneUi;
    window.saasRenewalPrepareTabSwitch = prepareTabSwitch;
    window.saasRenewalHideFormInPane = hideFormInPane;
    window.saasRenewalShowFormInPane = showFormInPane;
    window.saasRenewalHideActiveForm = hideFormInVisiblePane;
    window.saasRenewalShowActiveForm = showFormInVisiblePane;
    window.saasRenewalSyncTab = syncTabFromVisiblePanel;

    $modal.on('click', '.saas-renewal-tab', function () {
        setActiveTab($(this));
    });

    $modal.on('click', '.form-bot-inner button, .form-bot-inner-second button, .form-bot-inner-third button', function () {
        markPlanSelected($(this));
    });

    $(document).on('click', '#dayleft .first-form-close-button', function () {
        var $pane = $(this).closest('[id$="_show"]');
        if ($pane.length) {
            saasRenewalShowFormInPane($pane.attr('id'));
        } else {
            showFormInVisiblePane();
        }
        $modal.find('#website1qr,#website2qr,#website3qr').hide();
        $modal.find('.is-selected').removeClass('is-selected');
    });

    $(document).on('click', '#dayleft .second-form-close-button', function () {
        var $pane = $(this).closest('[id$="_show"]');
        if ($pane.length) {
            saasRenewalShowFormInPane($pane.attr('id'));
        } else {
            showFormInVisiblePane();
        }
        $modal.find('[id$="qr"]').filter(function () {
            return $(this).closest('#dayleft').length;
        }).hide();
        $modal.find('.is-selected').removeClass('is-selected');
    });

    $modal.on('shown.bs.modal', function () {
        var $vis = $visiblePane();
        if (!$vis.length) {
            hideAllPanels();
            resetPaneUi();
            $('#scan_show').show();
            setActiveTab($modal.find('.saas-renewal-tab').first());
        } else {
            syncTabFromVisiblePanel();
        }
    });

})(window.jQuery);
