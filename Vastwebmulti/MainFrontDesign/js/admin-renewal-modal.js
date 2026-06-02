/**
 * Website Renewal modal (#dayleft) — UI enhancements (no business logic changes)
 */
(function ($) {
    'use strict';

    if (!$ || !$('#dayleft').length) return;

    var $modal = $('#dayleft');

    function setActiveTab($btn) {
        $modal.find('.saas-renewal-tab, .modalbutton-show button').removeClass('active');
        $btn.addClass('active');
        var el = $btn[0];
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function markPlanSelected($btn) {
        var $card = $btn.closest('.form-bot-inner, .form-bot-inner-second, .form-bot-inner-third, .saas-renewal-plan-card');
        $modal.find('.is-selected').removeClass('is-selected');
        if ($card.length) $card.addClass('is-selected');
    }

    $modal.on('click', '.saas-renewal-tab, .modalbutton-show button', function () {
        setActiveTab($(this));
    });

    $modal.on('click', '.form-bot-inner button, .form-bot-inner-second button, .form-bot-inner-third button', function () {
        markPlanSelected($(this));
    });

    $(document).on('click', '#dayleft .first-form-close-button, #dayleft .second-form-close-button', function () {
        $modal.find('.is-selected').removeClass('is-selected');
    });

    $modal.on('shown.bs.modal', function () {
        var $visible = $modal.find('.saas-renewal-panels > [id$="_show"]:visible').first();
        var panelId = $visible.attr('id');
        var tabMap = {
            scan_show: 0,
            website_show: 1
        };
        var $tabs = $modal.find('.saas-renewal-tab');
        if (panelId && tabMap[panelId] !== undefined && $tabs.length) {
            setActiveTab($tabs.eq(tabMap[panelId]));
        }
    });

})(window.jQuery);
