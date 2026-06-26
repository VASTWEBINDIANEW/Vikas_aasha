from pathlib import Path

path = Path(r'd:\Vikas_aasha_web_clone_new\Vastwebmulti\Areas\ADMIN\Views\Home\DistibutorList.cshtml')
text = path.read_text(encoding='utf-8')

modern_head = '''<script src="~/Scripts/jquery-1.10.2.min.js"></script>
<script src="~/Scripts/jquery.validate.min.js"></script>
<script src="~/Scripts/jquery.validate.unobtrusive.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/css/toastr.css" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>

<link href="~/MainFrontDesign/css/admin-account-page-modern.css" rel="stylesheet" />
<link href="~/MainFrontDesign/css/admin-modal-modern.css" rel="stylesheet" />
<link href="~/MainFrontDesign/css/admin-report-page-responsive.css" rel="stylesheet" />
<link href="~/MainFrontDesign/css/admin-fund-transfer-modern.css?v=22" rel="stylesheet" />
<link href="~/MainFrontDesign/css/admin-fund-transfer-mobile.css?v=21" rel="stylesheet" />
<link href="~/MainFrontDesign/css/admin-master-list-modern.css?v=12" rel="stylesheet" />

<style>
    body.stop-scrolling { overflow: inherit; overflow-x: hidden; }
    #mdList i, #distributorlist i { cursor: pointer; }
    .toast-top-right1 { top: 65px; left: 81%; }
    .master-form-select .select2-container { height: 38px; }
    .DistibutorList_page .onoffswitch { width: auto; min-width: 110px; height: 32px; margin: 0; }
    .DistibutorList_page .costom-on, .DistibutorList_page .custom-off { font-size: 11px !important; }
    .vm-dl-recharge-seller-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9px; border: 1px solid #dbe2ea; background: #fff; color: #2563eb; font-size: 0.78rem; font-weight: 700; text-decoration: none !important; white-space: nowrap; }
    .vm-dl-recharge-seller-link:hover { background: #eff6ff; color: #1d4ed8; }
</style>
'''

start = text.find('<style>')
end = text.find('</style>', start)
if start == -1 or end == -1:
    raise SystemExit('style block not found')
end += len('</style>')
# skip duplicate toastr link/script if immediately after
rest = text[end:]
for prefix in [
    '\r\n<link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/css/toastr.css" rel="stylesheet" />',
    '\n<link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/css/toastr.css" rel="stylesheet" />',
]:
    if rest.startswith(prefix):
        rest = rest[len(prefix):]
for prefix in [
    '\r\n<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>',
    '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>',
]:
    if rest.startswith(prefix):
        rest = rest[len(prefix):]

text = text[:start] + modern_head + rest

old_shell = '''<section class="content DistibutorList_page fourdesign-section-admin">
    <div class="container-fluid">

        <!--Four-Design-Admin-page-Header-Section-Start-->
        <div class="page-title-box-fourde-admin">
            <h3>Distibutor List</h3>
            <ul>
                <li><a href="@Url.Action("Dashboard","Home")" style="color:var(--fullbodybg-four);">Home&nbsp;&nbsp;<i class="fa fa-angle-right"></i></a></li>
                <li><a href="javascript:void(0);">User's & Account&nbsp;&nbsp;<i class="fa fa-angle-right"></i></a></li>
                <li><a href="javascript:void(0);">Distibutor List</a></li>
            </ul>
        </div>
        <!--Four-Design-Admin-page-Header-Section-End-->

        <div class="page-header-third pageheader-margin-third">
            <div class="bread-same-all-page breadsameall-second four-noneclass-admin-only res_div">
                <ul>
                    <li class="smli">
                        <a href="@Url.Action("Dashboard", "Home")" class="fullbodydycolorbg tmw-total-color-one">
                            Dashboard&nbsp;<img src="~/ashok-images/rightaeps.svg" alt="right-arrow" style="width:12px;margin-top:-2px;" />
                        </a>
                    </li>
                    <li class="fullbodydycolorbg tmw-total-color-one" style="line-height: 22px;">
                        Distributor
                    </li>
                </ul>
            </div>


            <div class="web-white-filter pdfexpoer-second pdf-third-design res_div" style="float: right;">

            </div>
            <div class="for-search tablesearch-second">
                <div class="search-after-third">
                    <a href="@Url.Action("DistibutorListforseller","Home")"><button style="float: right;">Recharge Seller</button></a>
                  <input style="float: right;" id="myInput" type="text" placeholder="Search..." onkeyup="myFunction()" />
                </div>
            </div>


        </div>


        <div class="row clearfix" style="margin-bottom:40px;">
            <div class="col-md-4 col-sm-4 col-xs-12 ">
                <div class="first-tab width100 float-left boxback-allpage-admin page-header-third">
                    <ul class="tabs width100 float-left tab-seconddesign tab-third-design">
                        <li class="tab-link current" data-tab="tab-7"><img src="~/images/reportimage/add-user-button.svg" alt="add user" class="create-add-image">&nbsp;&nbsp;Create Distributor</li>
                        <li class="tab-link" data-tab="tab-8"><img src="~/images/reportimage/create-group-button.svg" alt="add user" class="create-bulk-add-image">Create Bulk Users</li>
                    </ul>



                    <div id="tab-7" class="tab-content current custom-table-responsive tabcurrent-seconddesign input-border-third">
                        <div class="left-four-tabs width100 float-left">'''

new_shell = '''<section class="content DistibutorList_page Masterlist-page saas-admin-account-page saas-admin-report-page saas-fund-transfer-page saas-fund-user-page saas-master-list-page saas-fund-transfer-premium">

    <div class="container-fluid vm-ft-page-shell">

        <div class="vm-ft-page-toolbar vm-ft-page-toolbar--premium">
            <div class="vm-ft-page-hero">
                <div>
                    <ol class="vm-ft-breadcrumb">
                        <li><a href="@Url.Action("Dashboard", "Home")"><i class="fas fa-home" aria-hidden="true"></i> Dashboard</a></li>
                        <li>User's &amp; Account</li>
                        <li>Distributor List</li>
                    </ol>
                </div>
            </div>
            <div class="vm-ft-search-wrap vm-dl-toolbar-actions">
                <a href="@Url.Action("DistibutorListforseller","Home")" class="vm-dl-recharge-seller-link"><i class="fas fa-store" aria-hidden="true"></i> Recharge Seller</a>
                <input class="form-control" type="text" id="myInput" name="myInput" placeholder="Search firm, name, mobile..." onkeyup="myFunction()" autocomplete="off" />
            </div>
        </div>

        <div class="col-md-12 vm-ft-layout-wrap">
            <div class="row clearfix vm-ft-layout vm-ft-layout--full">
                <div class="col-md-4 col-sm-12 vm-ft-form-col">
                    <div class="fund-trasfer-left fund-user-left vm-ft-form-card">
                        <div class="vm-ft-form-card-header">
                            <div class="vm-ft-form-card-header__icon" aria-hidden="true">
                                <i class="fas fa-users"></i>
                            </div>
                            <div>
                                <span class="vm-ft-form-card-header__title">Create Distributor</span>
                                <span class="vm-ft-form-card-header__sub">Add single or bulk distributor users</span>
                            </div>
                        </div>
                    <ul id="tabs" class="tabs width100 float-left tab-seconddesign tab-third-design vm-ft-role-tabs">
                        <li class="tab-link current vm-ft-role-tab-li vm-ft-role-tab-li--active" data-tab="tab-7">
                            <span class="vm-ft-role-tab"><span class="vm-ft-role-tab__icon"><i class="fas fa-user-plus" aria-hidden="true"></i></span><span class="vm-ft-role-tab__label">Create Distributor</span></span>
                        </li>
                        <li class="tab-link vm-ft-role-tab-li vm-ft-role-tab-li--inactive" data-tab="tab-8">
                            <span class="vm-ft-role-tab"><span class="vm-ft-role-tab__icon"><i class="fas fa-users" aria-hidden="true"></i></span><span class="vm-ft-role-tab__label">Bulk Users</span></span>
                        </li>
                    </ul>

                    <div id="tab-7" class="tab-content current vm-ml-tab-panel input-border-third">
                        <div class="left-four-tabs width100 vm-ml-create-form fund-transfer-form">'''

if old_shell not in text:
    raise SystemExit('old shell not found')
text = text.replace(old_shell, new_shell, 1)

old_right = '''            <div class="col-md-8 col-sm-8 col-xs-12 ">
                <div class="right-tabs width100 float-left custom-table-responsive page-header-third">
                    <div id="distributorlist" class="tablefourdesign-admin">
                        @Html.Partial("_DistibutorList")

                    </div>
                </div>
            </div>
        </div>



    </div>
    <div id="div-loader" style="display:none; position: fixed;top: 0px;background: rgba(0,0,0,.5);left: 0px;bottom: 0px;right: 0px;width: 100%;height: 100vh;z-index: 9999;">
        <div id="loader" style="position: absolute;right: 34%;top: 50%;display:block; transform: translate(-34%,-50%);">
            <div class="loadingio-spinner-ripple-92ar2pfqk5j" style="background:transparent;">
                <div class="ldio-zdyd6mf6t5">
                    <div></div><div></div>
                </div>
            </div>
        </div>
    </div>
</section>'''

new_right = '''                <div class="col-md-8 col-sm-12 fund-transfer-main-admin vm-ft-history-col for-padd" style="padding-left:0;">
                    <div class="fund-trasfer-right fund-user-right vm-ft-history-panel">
                        <div class="vm-ft-history-body">
                            <div class="vm-ft-history-toolbar vm-ft-history-toolbar--premium vm-ml-list-toolbar">
                                <div class="vm-ml-list-toolbar__row">
                                    <div class="vm-ft-history-toolbar__head vm-ml-list-toolbar__head">
                                        <i class="fas fa-list-alt" aria-hidden="true"></i>
                                        <div class="vm-ml-list-toolbar__text">
                                            <span class="vm-ft-history-toolbar__title">Distributor List</span>
                                            <span class="vm-ft-history-toolbar__sub">View, search &amp; export distributor records</span>
                                        </div>
                                    </div>
                                    <div class="vm-ft-export-group vm-ml-list-toolbar__exports">
                                        <button type="button" id="btnExport" class="vm-ft-export-btn vm-ft-export-btn--excel" title="Export Excel"><i class="fas fa-file-excel" aria-hidden="true"></i></button>
                                        <button type="button" id="btnPDF" class="vm-ft-export-btn vm-ft-export-btn--pdf" title="Export PDF"><i class="fas fa-file-pdf" aria-hidden="true"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div id="distributorlist" class="vm-ml-table-host">
                                @Html.Partial("_DistibutorList")
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="div-loader" class="div-loader vm-ml-page-loader" style="display:none;">
        <div id="loader">
            <div class="loadingio-spinner-ripple-92ar2pfqk5j" style="background:transparent;">
                <div class="ldio-zdyd6mf6t5">
                    <div></div><div></div>
                </div>
            </div>
        </div>
    </div>

</section>
@Html.Partial("_DistibutorlistModals")'''

if old_right not in text:
    raise SystemExit('old right column not found')
text = text.replace(old_right, new_right, 1)

path.write_text(text, encoding='utf-8')
print('DistibutorList shell updated')
