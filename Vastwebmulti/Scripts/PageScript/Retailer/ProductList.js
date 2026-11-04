function vmEcommSetActiveSub(subId) {
    jQuery('.vm-ecomm-sub-link').removeClass('is-active');
    jQuery('#Catagories_li').removeClass('is-active').attr('aria-pressed', 'false');
    if (subId) {
        jQuery('.vm-ecomm-sub-link[data-sub-id="' + subId + '"]').addClass('is-active');
    }
}

function vmEcommSyncSearchToAjaxForm() {
    var term = jQuery.trim(jQuery('#txtSearch').val() || '');
    jQuery('#ProductName').val(term);
}

function getProductBySubCataID(subcatid) {
    var id = subcatid;
    vmEcommSyncSearchToAjaxForm();
    jQuery('#SubCatId').val(id);
    vmEcommSetActiveSub(id);
    jQuery('#lstProductsSubmit').click();
}

function vmEcommBindCategoryUi() {
    jQuery('#Catagories_li, #Catagories_li_empty_trigger').off('click.vmEcomm').on('click.vmEcomm', function () {
        jQuery('#ProductName').val('');
        jQuery('#SubCatId').val('');
        jQuery('#Price').val('');
        jQuery('#SortBy').val('');
        jQuery('#FilterBy').val('');
        jQuery('#txtSearch').val('');
        jQuery('.vm-ecomm-sub-link').removeClass('is-active');
        jQuery('#Catagories_li').addClass('is-active').attr('aria-pressed', 'true');
        jQuery('#lstProductsSubmit').click();
    });

    jQuery('#vmEcommCatFilter').off('input.vmEcomm').on('input.vmEcomm', function () {
        var q = jQuery(this).val().toLowerCase().trim();
        jQuery('#vmEcommAccordion .vm-ecomm-accordion__item').each(function () {
            var $item = jQuery(this);
            var catName = ($item.data('cat-name') || '').toString().toLowerCase();
            var anyVisible = false;
            $item.find('.vm-ecomm-categories__subs li').each(function () {
                var $li = jQuery(this);
                var subName = ($li.data('sub-name') || '').toString().toLowerCase();
                var match = !q || catName.indexOf(q) >= 0 || subName.indexOf(q) >= 0;
                $li.toggle(match);
                if (match) {
                    anyVisible = true;
                }
            });
            $item.toggle(anyVisible || !q);
            if (q && anyVisible) {
                $item.find('.vm-ecomm-accordion__body').addClass('in').css('height', 'auto');
                $item.find('.vm-ecomm-accordion__head').attr('aria-expanded', 'true');
            }
        });
    });
}

jQuery(function () {
    vmEcommBindCategoryUi();
});

function OnComplete() {
    if (typeof vmEcommInitSearchAutocomplete === 'function') {
        vmEcommInitSearchAutocomplete();
    }
    vmEcommBindCategoryUi();
    var activeSub = jQuery('#SubCatId').val();
    if (activeSub) {
        vmEcommSetActiveSub(activeSub);
    } else if (!jQuery('#SubCatId').val()) {
        jQuery('#Catagories_li').addClass('is-active').attr('aria-pressed', 'true');
    }
}
