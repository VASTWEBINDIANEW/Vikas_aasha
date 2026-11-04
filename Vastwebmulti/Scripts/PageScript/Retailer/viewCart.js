function vmEcommCartQtyInput(productId) {
    return $('#txtQTY_' + productId);
}

function vmEcommCartReadQty(productId) {
    var $input = vmEcommCartQtyInput(productId);
    var val = parseInt($input.val(), 10);
    return isNaN(val) ? 0 : val;
}

function vmEcommCartSubmitQty(productId, qty) {
    $('#productId').val(productId);
    $('#QTY').val(qty);
    $('#viewCartSubmit').click();
}

function onMinus(id) {
    var QTY = vmEcommCartReadQty(id);
    vmEcommCartSubmitQty(id, QTY - 1);
}

function onPluse(id) {
    var QTY = vmEcommCartReadQty(id);
    vmEcommCartSubmitQty(id, QTY + 1);
}

function onChange(textBox, id) {
    var $box = $(textBox);
    var QTY = parseInt(textBox.value, 10);
    var prev = parseInt($box.data('lastQty'), 10);
    if (isNaN(prev)) {
        prev = QTY;
    }
    if (isNaN(QTY) || QTY < 1) {
        textBox.value = prev > 0 ? prev : 1;
        return;
    }
    if (QTY === prev) {
        return;
    }
    $box.data('lastQty', QTY);
    vmEcommCartSubmitQty(id, QTY);
}

function isNumber(evt) {
    var iKeyCode = (evt.which) ? evt.which : evt.keyCode;
    if (iKeyCode !== 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57)) {
        return false;
    }
    return true;
}

/* onRemoveItem — defined on viewCart.cshtml (confirm + Ajax) */
