

$('[data-toggle="tabajax"]').click(function (e) {
    var $this = $(this),
        loadurl = $this.attr('href'),
        targ = $this.attr('data-tab');

    $.get(loadurl, function (data) {
        $(targ).html(data);
    });

    $this.tab('show');
    return false;
});

/** Category / service row toggles (modern OperatorIndex CSS + select2) */
function oiPgCatVal($sel) {
    return ($sel.val() || '').toString().trim();
}
function oiPgShow(sel) {
    $(sel).each(function () {
        $(this).show();
        if (window.oiCondFieldShow) {
            window.oiCondFieldShow(this);
        } else {
            this.style.setProperty('display', 'block', 'important');
        }
    });
}
function oiPgHide(sel) {
    $(sel).each(function () {
        $(this).hide();
        if (window.oiCondFieldHide) {
            window.oiCondFieldHide(this);
        } else {
            this.style.setProperty('display', 'none', 'important');
        }
    });
}
function oiPgReinitSelect2(selector) {
    var $el = $(selector);
    if (!$el.length) {
        return;
    }
    if (window.oiInitOperatorIndexSelects) {
        try {
            if ($el.hasClass('select2-hidden-accessible') && $.fn.select2) {
                $el.select2('destroy');
            }
        } catch (e1) { }
        window.oiInitOperatorIndexSelects($el.closest('.tab-content, .OperatorIndex_Page'));
        return;
    }
    if (!$.fn.select2) {
        return;
    }
    try {
        if ($el.hasClass('select2-hidden-accessible')) {
            $el.select2('destroy');
        }
    } catch (e2) { }
    $el.select2({
        width: '100%',
        dropdownParent: $(document.body),
        minimumResultsForSearch: $el.find('option').length > 8 ? 0 : Infinity
    });
    if (window.forceAdminSelect2 && $el[0]) {
        try {
            window.forceAdminSelect2($el.closest('.tab-content')[0] || $el[0].form || document.body);
        } catch (e3) { }
    }
}
window.oiPgReinitSelect2 = oiPgReinitSelect2;
window.oiPgShow = oiPgShow;
window.oiPgHide = oiPgHide;

function oiPgLoadServiceList(surl, name, $serviceSelect) {
    $.ajax({
        type: 'POST',
        url: surl,
        data: { name: name },
        success: function (result) {
            $serviceSelect.empty();
            $serviceSelect.append($('<option></option>').text('Select Service').val(''));
            $.each(result, function (i, item) {
                $serviceSelect.append($('<option></option>').text(item.Text).val(item.Value));
            });
            oiPgReinitSelect2($serviceSelect);
        }
    });
}

function oiPgOnRoleCategoryChange(cfg) {
    var $cat = $(cfg.categorySel);
    if (!$cat.length) {
        return;
    }
    var url = $cat.data('request-url') || cfg.fillUrl;
    var surl = $cat.data('secondrequest-url') || cfg.bindUrl;
    $(cfg.operatorSel).empty();
    $(cfg.serviceSel).empty();
    var name = oiPgCatVal($cat);
    if (!name) {
        if (cfg.serviceWrap) {
            oiPgHide(cfg.serviceWrap);
        }
        if (cfg.operatorWrap) {
            oiPgHide(cfg.operatorWrap);
        }
        return;
    }
    if (name === 'PrePaid') {
        if (cfg.serviceWrap) {
            oiPgHide(cfg.serviceWrap);
        }
        if (cfg.operatorWrap) {
            oiPgShow(cfg.operatorWrap);
        }
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var $op = $(cfg.operatorSel);
                $op.empty();
                $op.append($('<option></option>').text('All Operator').val(''));
                $.each(result, function (i, item) {
                    $op.append($('<option></option>').text(item.Text).val(item.Value));
                });
                oiPgReinitSelect2($op);
            }
        });
        return;
    }
    if (name === 'Utility' || name === 'Finance' || name === 'Travels' || name === 'Others') {
        $(cfg.operatorSel).empty();
        if (cfg.operatorWrap) {
            oiPgHide(cfg.operatorWrap);
        }
        if (cfg.serviceWrap) {
            oiPgShow(cfg.serviceWrap);
        }
        oiPgLoadServiceList(surl, name, $(cfg.serviceSel));
    }
}

function oiPgOnApiUserCategoryChange() {
    oiPgOnRoleCategoryChange({
        categorySel: '#APIUSERCategory',
        operatorSel: '#APIUSEROperator',
        serviceSel: '#APIUSERService',
        serviceWrap: '#APIUSERservpro',
        operatorWrap: '#APIUSERoperatorsselect'
    });
}

function oiPgOnDCategoryChange() {
    oiPgOnRoleCategoryChange({
        categorySel: '#DCategory',
        operatorSel: '#DOperator',
        serviceSel: '#DService',
        serviceWrap: '#Dservpro',
        operatorWrap: '#DOperatorselect'
    });
}

function oiPgOnWhiteLabelCategoryChange() {
    oiPgOnRoleCategoryChange({
        categorySel: '#WhiteLabelCategory',
        operatorSel: '#WhitelabelOperator',
        serviceSel: '#WhitelabelService',
        serviceWrap: '#Whitelabelservpro',
        operatorWrap: '#Whitelabeloperatorsselect'
    });
}

function oiPgOnRetailerCategoryChange() {
    oiPgOnRoleCategoryChange({
        categorySel: '#RequireCategory',
        operatorSel: '#operatornameid',
        serviceSel: '#service123',
        serviceWrap: '#servpro',
        operatorWrap: '#operatorsselect'
    });
}

$(function () {
    var catIds = '#RequireCategory,#DCategory,#WhiteLabelCategory,#APIUSERCategory';
    $(document).off('change.oiPgApi', '#APIUSERCategory').on('change.oiPgApi', '#APIUSERCategory', oiPgOnApiUserCategoryChange);
    $(document).off('change.oiPgDist', '#DCategory').on('change.oiPgDist', '#DCategory', oiPgOnDCategoryChange);
    $(document).off('change.oiPgWl', '#WhiteLabelCategory').on('change.oiPgWl', '#WhiteLabelCategory', oiPgOnWhiteLabelCategoryChange);
    $(document).off('change.oiPgRet', '#RequireCategory').on('change.oiPgRet', '#RequireCategory', oiPgOnRetailerCategoryChange);
    $(document).on('select2:select', catIds, function () {
        $(this).trigger('change');
    });
});


function fillservices2(name, id) {
    var url = $('#FillOperatorType').val();
    var surl = $('#BindService').val();
    $('#DDOperatorlist').empty()
    // servicelist
    $('#DDServicelist').empty()
    if (name == "PrePaid") {
        $('#DDServicelist').hide();
        $('#DDOperatorlist').show();
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#DDOperatorlist');
                //operatornameid.empty(); // remove any existing options
                operatornameid.append($('<option></option>').text('Select Operator').val(''))
                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Utility") {
        $('#DDOperatorlist').hide();
        $('#DDServicelist').show();
        //  $('#Operatorlist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#DDServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Finance") {

        $('#DDOperatorlist').empty();
        $('#DDServicelist').show();
        $('#DDOperatorlist').hide();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#DDServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Travels") {
        $('#DDOperatorlist').hide();
        $('#DDOperatorlist').empty();
        $('#DDServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#DDServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Others") {
        $('#DDOperatorlist').hide();
        $('#DDOperatorlist').empty();
        $('#DDServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#DDServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }


}




function Distributor(dd) {

    $('#Distributorlist').empty();
    // var urld = $(this).data('request-url');
    $.ajax({
        type: 'POST',

        url: dd,
        success: function (data) {
            $.each(data.dealer, function (result, item) {
                $('#Distributorlist').append($('<option></option>').text(item.Text).val(item.Value));

            });
            $.each(data.list, function (result, item) {
                $('#DCategory').append($('<option></option>').text(item.Text).val(item.Value));

            });

        }
    });
}


/* #DCategory — see oiPgOnDCategoryChange (delegated) */





$('#DService').change(function () {
    var url = $(this).data('request-url');
    var name = $('#DService').val();
    $('#DOperator').empty();
    if (name == "Finance" || name == "Travels" || name == "Others") {
        $('DOperatorselect').hide();
    }
    else {
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#DOperator');
                operatornameid.empty(); // remove any existing options

                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });

    }


})

$('#DDCategorylist').change(function () {

    fillservices2($('#DDCategorylist').val(), $('#DDCategorylist').attr('id'));




})


function onTestFailure1(data) {

}

function onTestSuccess1(data) {
    $('#DDistributorlist').empty();
    $('#DDCategorylist').empty();
    urls = $('#Durl').val();
    $('#DDOperatorlist').hide();
    //$('#Categorylist').append($('<option></option>').text('Select Category').val(''))

    $.each(data.dealer, function (data, item) {
        $('#DDistributorlist').append($('<option></option>').text(item.Text).val(item.Value));

    })
    $.each(data.category, function (data, item) {
        $('#DDCategorylist').append($('<option></option>').text(item.Text).val(item.Value));

    })


    var tblHtml = "";
    $.each(data.list, function (a, b) {

        //tblHtml+= "<tr><td>"+b.idno+"</td>";
        tblHtml += "<tr><td>" + b.DealerName + "</td>";
        tblHtml += "<td>" + b.FarmName + "</td>";
        tblHtml += "<td>" + b.Operator_type + "</td>";
        tblHtml += "<td>" + b.operator_Name + "</td>";
        // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.RetailerName +"','"+b.status+"') data-target='#defaultModal12'> Edit</button></td></tr>"

        if (b.status == true || b.status == "Y") {
            tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
        }
        else if (b.status == false || b.status == "N") {
            tblHtml += "<td> <button class='switch-edit-button new-button' onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button> </td></tr>";

            // tblHtml += "<td><center> <img src='../../images/reportimage/unblock.png'   onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



        }
        // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

    });
    $("#mytableDealer > tbody").html(tblHtml);

}

$('#btnDsearch').click(function () {
    urls = $('#BlockDealerList').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { opid: $('#DDOperatorlist').val(), retid: $('#DDistributorlist').val(), serid: $('#DDServicelist').val(), categoryname: $('#DDCategorylist').val() },
        success: function (result) {


            var tblHtml = "";
            $.each(result.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.DealerName + "</td>";
                tblHtml += "<td>" + b.FarmName + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td> <button class='switch-edit-button new-button' onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button> </td></tr>";

                    // tblHtml += "<td><center> <img src='../../images/reportimage/unblock.png'   onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#mytableDealer > tbody").html(tblHtml);




        }

    });
});


function Dealaerstatusupdate(id, rem, opertype) {
    opertype = decodeURI(opertype);
    urls = $('#Dealaerstatusupdate').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { id: id, rem: rem, opertype: opertype },
        success: function (data) {

            var tblHtml = "";
            $.each(data.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.DealerName + "</td>";
                tblHtml += "<td>" + b.FarmName + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td> <button class='switch-edit-button new-button'  onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button> </td></tr>";
                    // tblHtml += "<td><center> <img src='../../images/reportimage/unblock.png'   onclick=Dealaerstatusupdate('" + b.id + "','" + b.dlmid + "','" + encodeURI(b.Operator_type)  + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#mytableDealer > tbody").html(tblHtml);



            if (data.status > 0) {
                swal("Good job!", "Data is Un-Blocked!", "success");
            }
            else {
                swal("Sorry !", "Data is Not Blocked!", "error");
            }
            //  var operatornameid = $('#Operatorlist');
            //  operatornameid.empty(); // remove any existing options

            //$.each(result, function (result, item) {
            //    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

            //});
            //window.location.reload(true);
        }
    });



}

$('#btn').click(function () {
    var my_object = 'Indego Nepal';
    var object_as_string = JSON.stringify(my_object);
    alert(object_as_string)

    var object_as_string_as_object = JSON.parse(object_as_string);
    alert(object_as_string_as_object)

})



//******************For Api User*****************************//




function onTestSuccess2(data) {
    

    urls = $('#Durl').val();
    $('#DDOperatorlist').hide();
    $('#AAPIUSERlist').empty();
    $('#AAPIUSERCategorylist').empty();
    //$('#Categorylist').append($('<option></option>').text('Select Category').val(''))
    $('#AAPIUSERlist').append($('<option></option>').text('Select ApiUser').val(''));
    $('#AAPIUSERCategorylist').append($('<option></option>').text('Select Category').val(''));
    $.each(data.dealer, function (data, item) {
        $('#AAPIUSERlist').append($('<option></option>').text(item.Text).val(item.Value));

    })
    $.each(data.category, function (data, item) {
        $('#AAPIUSERCategorylist').append($('<option></option>').text(item.Text).val(item.Value));

    })


    var tblHtml = "";
    $.each(data.list, function (a, b) {

        //tblHtml+= "<tr><td>"+b.idno+"</td>";
        tblHtml += "<tr><td>" + b.username + "</td>";
        tblHtml += "<td>" + b.farmname + "</td>";
        tblHtml += "<td>" + b.Operator_type + "</td>";
        tblHtml += "<td>" + b.operator_Name + "</td>";
        if (b.status == true || b.status == "Y") {
            tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
        }
        else if (b.status == false || b.status == "N") {
            tblHtml += "<td><button class='switch-edit-button new-button'  onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
            // tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



        }
        // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

    });


    $("#apiusertable > tbody").html(tblHtml);


}


/* #APIUSERCategory — see oiPgOnApiUserCategoryChange (delegated) */

function BlockAPIUSERS(result) {
    if (result == 1) {
        $('.for-ap-us').click();
        //swal("Good job!", "APIUSER has been Blocked!", "success");
    }
}



function fillservices3(name, id) {
    var url = $('#FillOperatorType').val();
    var surl = $('#BindService').val();
    $('#APIUSEROperatorlist').empty()
    // servicelist
    $('#AAPIUSERServicelist').empty()
    if (name == "PrePaid") {
        $('#AAPIUSERServicelist').hide();
        $('#APIUSEROperatorlist').show();
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#APIUSEROperatorlist');
                //operatornameid.empty(); // remove any existing options
                operatornameid.append($('<option></option>').text('Select Operator').val(''))
                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Utility") {
        $('#APIUSEROperatorlist').hide();
        $('#AAPIUSERServicelist').show();
        //  $('#Operatorlist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#AAPIUSERServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Finance") {

        $('#APIUSEROperatorlist').empty();
        $('#AAPIUSERServicelist').show();
        $('#APIUSEROperatorlist').hide();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#AAPIUSERServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Travels") {
        $('#APIUSEROperatorlist').hide();
        $('#APIUSEROperatorlist').empty();
        $('#AAPIUSERServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#AAPIUSERServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Others") {
        $('#APIUSEROperatorlist').hide();
        $('#APIUSEROperatorlist').empty();
        $('#AAPIUSERServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#AAPIUSERServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }


}


$('#AAPIUSERCategorylist').change(function () {

    fillservices3($('#AAPIUSERCategorylist').val(), $('#AAPIUSERCategorylist').attr('id'));




})





$('#APIUSERService').change(function () {
    var url = $(this).data('request-url');
    var name = $('#APIUSERService').val();
    $('#APIUSEROperator').empty();
    if (name == "Finance" || name == "Travels" || name == "Others") {
        $('APIUSERservpro').hide();
    }
    else {
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#APIUSEROperator');
                operatornameid.empty(); // remove any existing options

                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });

    }


})


$('#btnsearchapiuser').click(function () {
    urls = $('#BlockAPIUSERLIist').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { opid: $('#APIUSEROperatorlist').val(), retid: $('#AAPIUSERlist').val(), serid: $('#AAPIUSERServicelist').val(), categoryname: $('#AAPIUSERCategorylist').val() },
        success: function (result) {


            var tblHtml = "";
            $.each(result.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.username + "</td>";
                tblHtml += "<td>" + b.farmname + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td><button class='switch-edit-button new-button'  onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
                    //tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#apiusertable > tbody").html(tblHtml);




        }

    });
});

function APIUSERstatusupdate(id, rem, opertype) {
    opertype = decodeURI(opertype);
    urls = $('#APIUSERstatusupdate').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { id: id, rem: rem, opertype: opertype },
        success: function (data) {

            var tblHtml = "";
            $.each(data.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.username + "</td>";
                tblHtml += "<td>" + b.farmname + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td><button class='switch-edit-button new-button'  onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
                    //tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=APIUSERstatusupdate('" + b.id + "','" + b.APIID + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#apiusertable > tbody").html(tblHtml);



            if (data.status > 0) {
                swal("Good job!", "Data is Un-Blocked!", "success");
            }
            else {
                swal("Sorry !", "Data is Not Blocked!", "error");
            }
            //  var operatornameid = $('#Operatorlist');
            //  operatornameid.empty(); // remove any existing options

            //$.each(result, function (result, item) {
            //    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

            //});
            //window.location.reload(true);
        }
    });



}


//*********************White Label*************************************************



function Whitelabelstatusupdate(id, rem, opertype) {
    opertype = decodeURI(opertype);
    urls = $('#Whitelabelstatusupdate').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { id: id, rem: rem, opertype: opertype },
        success: function (data) {

            var tblHtml = "";
            $.each(data.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.Name + "</td>";
                tblHtml += "<td>" + b.FrmName + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td><button class='switch-edit-button new-button'  onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
                    //tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#whitelabeltable > tbody").html(tblHtml);



            if (data.status > 0) {
                swal("Good job!", "Data is Un-Blocked!", "success");
            }
            else {
                swal("Sorry !", "Data is Not Blocked!", "error");
            }
            //  var operatornameid = $('#Operatorlist');
            //  operatornameid.empty(); // remove any existing options

            //$.each(result, function (result, item) {
            //    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

            //});
            //window.location.reload(true);
        }
    });



}




$('#btnsearchWhitelabel').click(function () {
    urls = $('#BlockWhiteLabelList').val();
    $.ajax({
        type: 'POST',
        url: urls,
        data: { opid: $('#whitelabeluserOperatorlist').val(), retid: $('#Whitelabeluserlist').val(), serid: $('#WhitelabeluserServicelist').val(), categoryname: $('#WhitelabeluserCategorylist').val() },
        success: function (result) {


            var tblHtml = "";
            $.each(result.list, function (a, b) {

                //tblHtml+= "<tr><td>"+b.idno+"</td>";
                tblHtml += "<tr><td>" + b.Name + "</td>";
                tblHtml += "<td>" + b.FrmName + "</td>";
                tblHtml += "<td>" + b.Operator_type + "</td>";
                tblHtml += "<td>" + b.operator_Name + "</td>";
                if (b.status == true || b.status == "Y") {
                    tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
                }
                else if (b.status == false || b.status == "N") {
                    tblHtml += "<td><button class='switch-edit-button new-button'  onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
                    //tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



                }
                // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

            });


            $("#whitelabeltable > tbody").html(tblHtml);




        }

    });
});



function onTestSuccess3(data) {
    

    urls = $('#Durl').val();
    $('#Whitelabeluserlist').empty();
    $('#WhitelabeluserCategorylist').empty();
    $('#whitelabeluserOperatorlist').hide();
    $('#Whitelabeluserlist').append($('<option></option>').text('Select WhiteLabel').val(''));
    $('#WhitelabeluserCategorylist').append($('<option></option>').text('Select Category').val(''))

    $.each(data.whitelabeluser, function (data, item) {
        $('#Whitelabeluserlist').append($('<option></option>').text(item.Text).val(item.Value));

    })
    $.each(data.category, function (data, item) {
        $('#WhitelabeluserCategorylist').append($('<option></option>').text(item.Text).val(item.Value));

    })


    var tblHtml = "";
    $.each(data.list, function (a, b) {

        //tblHtml+= "<tr><td>"+b.idno+"</td>";
        tblHtml += "<tr><td>" + b.Name + "</td>";
        tblHtml += "<td>" + b.FrmName + "</td>";
        tblHtml += "<td>" + b.Operator_type + "</td>";
        tblHtml += "<td>" + b.operator_Name + "</td>";
        if (b.status == true || b.status == "Y") {
            tblHtml += "<td>  <center><img src='../../images/reportimage/switch_on.png' onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";
        }
        else if (b.status == false || b.status == "N") {
            tblHtml += "<td><button class='switch-edit-button new-button' onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') >Unblock</button></td></tr>";
            //tblHtml += "<td><center> <img src='../../images/reportimage/switchoff.png'   onclick=Whitelabelstatusupdate('" + b.id + "','" + b.nuserid + "','" + encodeURI(b.Operator_type) + "') style='margin-top:2px;height:23px;' /></center></td></tr>";



        }
        // tblHtml+="<td><button class='bt btn-default' data-toggle='modal' onclick=animation('"+b.idno +"','"+encodeURIComponent(b.sms)+"','"+b.smsapi+"','"+b.sim+"') data-target='#defaultModal12'> Edit</button></td></tr>"

    });


    $("#whitelabeltable > tbody").html(tblHtml);


}





$('#WhitelabelService').change(function () {
    var url = $(this).data('request-url');
    var surl = $(this).data('secondrequest-url');

    var name = $('#WhitelabelService').val();
    if (name == "Insurance" || name == "Loan" || name == "Money") {
        $('#Whitelabeloperatorsselect').show();
        $('#WhitelabelOperator').empty();
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#WhitelabelOperator');
                operatornameid.empty(); // remove any existing options

                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });

    }
    else {
        $('#operatorsselect').hide();
    }


})




/* #WhiteLabelCategory — see oiPgOnWhiteLabelCategoryChange (delegated) */


$('#WhitelabeluserCategorylist').change(function () {

    fillservices4($('#WhitelabeluserCategorylist').val(), $('#WhitelabeluserCategorylist').attr('id'));




})


function fillservices4(name, id) {
    var url = $('#FillOperatorType').val();
    var surl = $('#BindService').val();
    $('#whitelabeluserOperatorlist').empty()
    // servicelist
    $('#WhitelabeluserServicelist').empty()
    if (name == "PrePaid") {
        $('#WhitelabeluserServicelist').hide();
        $('#whitelabeluserOperatorlist').show();
        $.ajax({
            type: 'POST',
            url: url,
            data: { name: name },
            success: function (result) {
                var operatornameid = $('#whitelabeluserOperatorlist');
                //operatornameid.empty(); // remove any existing options
                operatornameid.append($('<option></option>').text('Select Operator').val(''))
                $.each(result, function (result, item) {
                    operatornameid.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Utility") {
        $('#whitelabeluserOperatorlist').hide();
        $('#WhitelabeluserServicelist').show();
        //  $('#Operatorlist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#WhitelabeluserServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Finance") {

        $('#whitelabeluserOperatorlist').empty();
        $('#WhitelabeluserServicelist').show();
        $('#whitelabeluserOperatorlist').hide();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#WhitelabeluserServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }
    if (name == "Travels") {
        $('#whitelabeluserOperatorlist').hide();
        $('#whitelabeluserOperatorlist').empty();
        $('#WhitelabeluserServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#WhitelabeluserServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }

    if (name == "Others") {
        $('#whitelabeluserOperatorlist').hide();
        $('#whitelabeluserOperatorlist').empty();
        $('#WhitelabeluserServicelist').show();
        $.ajax({
            type: 'POST',
            url: surl,
            data: { name: name },
            success: function (result) {
                var service123 = $('#WhitelabeluserServicelist');
                service123.empty(); // remove any existing options
                service123.append($('<option></option>').text('Select Service').val(''));
                $.each(result, function (result, item) {
                    service123.append($('<option></option>').text(item.Text).val(item.Value));

                });
                //window.location.reload(true);
            }
        });
    }


}

function BlockWhitelabel(result) {
    if (result == 1) {

        swal("Good job!", "WhiteLabel USER has been Blocked!", "success");
    }
}