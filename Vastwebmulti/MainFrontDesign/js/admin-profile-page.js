/**
 * Admin Profile page — hide/show panels, support save, user OTP popups
 */
(function ($) {
    'use strict';

    var $page = $('.saas-prof-page');
    if (!$page.length) {
        return;
    }

    var urls = {
        updateSupport: $page.data('update-support-url') || '',
        profile: $page.data('profile-url') || '',
        otpList: $page.data('otp-list-url') || '',
        otpUser: $page.data('otp-user-url') || '',
        otpRole: $page.data('otp-role-url') || '',
        otpStatus: $page.data('otp-status-url') || ''
    };

    var otpListMap = {
        master: '#masterlist',
        Dealer: '#dealerlist',
        Retailer: '#retailerlist',
        API: '#apilist',
        Whitelabel: '#whitelabellist'
    };

    var otpSelectMap = {
        master: '#Sortbymaster',
        Dealer: '#Sortbydealer',
        Retailer: '#Sortbyretailer',
        API: '#SortbyAPI',
        Whitelabel: '#SortbyWhitelabel'
    };

    function swalProf(title, text, type) {
        if (typeof swal === 'function') {
            swal(title, text, type);
        } else {
            alert(title + (text ? ': ' + text : ''));
        }
    }

    function swalProfConfirm(title, text, onConfirm) {
        if (typeof swal === 'function') {
            swal({
                title: title,
                text: text,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Yes, continue',
                cancelButtonText: 'Cancel',
                closeOnConfirm: true
            }, function (isConfirm) {
                if (isConfirm) {
                    onConfirm();
                }
            });
        } else if (window.confirm(title + '\n' + text)) {
            onConfirm();
        }
    }

    function escHtml(val) {
        if (val == null) {
            return '';
        }
        return String(val)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getRolePasscodeType(roleName) {
        var sel = otpSelectMap[roleName];
        return sel ? ($(sel).val() || 'OFF') : 'OFF';
    }

    function resolveRoleFromResponse(data) {
        if (!data) {
            return null;
        }
        if (Array.isArray(data)) {
            return data[0] || null;
        }
        if (typeof data === 'string') {
            return data;
        }
        return null;
    }

    function buildOtpActionCell(item, roleName) {
        var roleType = getRolePasscodeType(roleName);
        var on = item.TwoFactorEnable === true;
        var pc = (item.passcodetype || 'OFF').toUpperCase();
        var btnVal;
        var label;
        var cssClass;

        if (on || pc === 'PERDAY' || pc === 'WEAKS' || pc === 'MONTHS') {
            btnVal = (pc === 'PERDAY' || pc === 'WEAKS' || pc === 'MONTHS') ? 'OFF' : 'N';
            label = 'ON';
            cssClass = 'saas-prof-otp-btn--on';
        } else {
            btnVal = roleType === 'OTP' ? 'Y' : roleType;
            label = 'OFF';
            cssClass = 'saas-prof-otp-btn--off';
        }

        return '<button type="button" class="saas-prof-otp-btn ' + cssClass + '" ' +
            'data-user-id="' + escHtml(item.UserId) + '" ' +
            'data-btn-val="' + escHtml(btnVal) + '" ' +
            'data-role="' + escHtml(roleName) + '">' + label + '</button>';
    }

    function renderOtpUserTable(roleName, data) {
        var listSel = otpListMap[roleName];
        if (!listSel) {
            return;
        }
        var rows = data || [];
        if (!rows.length) {
            $(listSel).html('<tr><td colspan="4" class="text-center text-muted">No users found for this role.</td></tr>');
            return;
        }
        var html = '';
        var id = 1;
        $.each(rows, function (i, item) {
            html += '<tr><td>' + id + '</td>' +
                '<td>' + escHtml(item.Email) + '</td>' +
                '<td>' + escHtml(item.Mobile) + '</td>' +
                '<td class="saas-prof-otp-action-cell">' + buildOtpActionCell(item, roleName) + '</td></tr>';
            id++;
        });
        $(listSel).html(html);
    }

    window.GetUser = function (roleName) {
        if (!urls.otpList) {
            swalProf('Error', 'Security list URL is not configured.', 'error');
            return;
        }
        $.ajax({
            type: 'GET',
            url: urls.otpList,
            data: { UserRole: roleName },
            dataType: 'json',
            cache: false,
            success: function (data) {
                renderOtpUserTable(roleName, data);
                if (typeof saasProfShowUserPanel === 'function') {
                    saasProfShowUserPanel(roleName);
                }
            },
            error: function () {
                swalProf('Error', 'Could not load user security list.', 'error');
            }
        });
    };

    function postUserOtpToggle(userid, btnVal, roleName) {
        if (btnVal === 'OTP') {
            btnVal = 'Y';
        }
        $.ajax({
            type: 'POST',
            url: urls.otpUser,
            data: { userid: userid, btnval: btnVal },
            dataType: 'json',
            cache: false,
            success: function (data) {
                var role = resolveRoleFromResponse(data) || roleName;
                GetUser(role);
                swalProf('Success', 'User security updated successfully.', 'success');
            },
            error: function () {
                swalProf('Error', 'Could not update user security. Please try again.', 'error');
            }
        });
    }

    window.OtpOnOffByIdALL = function (userid, btnsts) {
        var roleName = null;
        postUserOtpToggle(userid, btnsts, roleName);
    };

    window.RoleWiseOTP = function (roleName, stsBtn) {
        if (!urls.otpRole) {
            return;
        }
        $.ajax({
            type: 'POST',
            url: urls.otpRole,
            data: { UserRole: roleName, btnVal: stsBtn, UserrId: '' },
            dataType: 'json',
            cache: false,
            success: function (data) {
                var role = resolveRoleFromResponse(data) || roleName;
                GetUser(role);
                if (typeof WriteOTPStatus === 'function') {
                    WriteOTPStatus(roleName, stsBtn);
                }
                swalProf('Success', 'Security updated for all users in this role.', 'success');
            },
            error: function () {
                swalProf('Error', 'Could not update role security.', 'error');
            }
        });
    };

    $(document).on('click', '.saas-prof-otp-btn', function (e) {
        e.preventDefault();
        var $btn = $(this);
        if ($btn.prop('disabled')) {
            return;
        }
        var userId = $btn.data('userId');
        var btnVal = $btn.data('btnVal');
        var roleName = $btn.data('role');
        var turningOn = $btn.hasClass('saas-prof-otp-btn--off');
        var msg = turningOn
            ? 'Enable login security (OTP/passcode) for this user?'
            : 'Turn OFF security for this user?';

        swalProfConfirm('Confirm security change', msg, function () {
            $btn.prop('disabled', true);
            postUserOtpToggle(userId, btnVal, roleName);
            setTimeout(function () {
                $btn.prop('disabled', false);
            }, 1200);
        });
    });

    function showEl($el) {
        if (!$el || !$el.length) return;
        $el.removeClass('saas-prof-hidden').css('display', '');
        if ($el.hasClass('saas-prof-layout__main')) {
            $el.css('display', 'block');
        }
    }

    function hideEl($el) {
        if (!$el || !$el.length) return;
        $el.addClass('saas-prof-hidden').hide();
    }

    window.saasProfShowUserPanel = function (roleName) {
        $('.saas-prof-user-panel').removeClass('is-open').hide();
        var map = {
            master: '.master-user-pop',
            Dealer: '.Distributor-user-pop',
            Retailer: '.retailer-user-pop',
            API: '.api-user-pop',
            Whitelabel: '.white-user-pop'
        };
        var sel = map[roleName];
        if (sel) {
            $(sel).addClass('is-open').show();
        }
    };

    window.saasProfHideUserPanels = function () {
        $('.saas-prof-user-panel').removeClass('is-open').hide();
    };

    window.saasProfCancelDetailsEdit = function () {
        $('#EditnameandpancardModal').hide();
        $('.saas-prof-details__view').show();
    };

    window.saasProfCancelAddressEdit = function () {
        $('#EditaddressModal').hide();
        $('#saasProfCompanyView').show();
        $('.saas-prof-overview-col--company .editprofile-second').show();
    };

    window.saasProfMaskAadhar = function (raw) {
        if (!raw || raw === 'Data Not Found !') {
            return 'Data Not Found !';
        }
        var s = String(raw).replace(/\s/g, '');
        if (s.length >= 4) {
            return 'XXXXXXXX' + s.substring(s.length - 4);
        }
        return raw;
    };

    window.saasProfFormatLaunchDate = function (val) {
        if (!val) {
            return '';
        }
        if (typeof val === 'string') {
            if (val.indexOf('/Date(') === 0) {
                var m = val.match(/\/Date\((-?\d+)\)\//);
                if (m) {
                    val = new Date(parseInt(m[1], 10));
                }
            } else if (/^\d{2}-\d{2}-\d{4}/.test(val)) {
                return val;
            }
        }
        var d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) {
            return String(val);
        }
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' +
            pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    };

    /* Customer Support */
    var $supportEmail = $('#SupportEmail');
    var $supportMobile = $('#SupportMobile');
    var supportSnapshot = { email: '', mobile: '' };

    function supportReadonly(on) {
        $supportEmail.add($supportMobile).prop('readonly', on);
    }

    function supportEditMode(on) {
        if (on) {
            supportSnapshot.email = $supportEmail.val() || '';
            supportSnapshot.mobile = $supportMobile.val() || '';
            $('#btnSupportEdit').hide();
            $('#btnSupportSave, #btnSupportCancel').show();
            supportReadonly(false);
            $supportEmail.focus();
        } else {
            $('#btnSupportEdit').show();
            $('#btnSupportSave, #btnSupportCancel').hide();
            supportReadonly(true);
        }
    }

    $('#btnSupportEdit').on('click', function () {
        supportEditMode(true);
    });

    $('#btnSupportCancel').on('click', function () {
        $supportEmail.val(supportSnapshot.email);
        $supportMobile.val(supportSnapshot.mobile);
        supportEditMode(false);
    });

    window.SavaDataSupport = function () {
        var id = $('#IDd').val();
        var email = ($supportEmail.val() || '').trim();
        var mobile = ($supportMobile.val() || '').trim();

        if (!email && !mobile) {
            if (typeof swal === 'function') {
                swal('Required', 'Please enter support email or customer care number.', 'warning');
            } else {
                alert('Please enter support email or customer care number.');
            }
            return;
        }

        if (mobile && mobile.length !== 10) {
            if (typeof swal === 'function') {
                swal('Invalid', 'Customer care number must be 10 digits.', 'warning');
            } else {
                alert('Customer care number must be 10 digits.');
            }
            return;
        }

        $.ajax({
            type: 'POST',
            url: urls.updateSupport,
            data: { ID: id, Email: email, Mobile: mobile },
            dataType: 'json',
            cache: false,
            success: function (result) {
                if (result === 'Success' || result === 'success') {
                    supportSnapshot.email = email;
                    supportSnapshot.mobile = mobile;
                    supportEditMode(false);
                    if (typeof swal === 'function') {
                        swal('Saved', 'Customer support details updated successfully.', 'success');
                    }
                } else {
                    if (typeof swal === 'function') {
                        swal('Failed', 'Could not save support details. Please try again.', 'error');
                    } else {
                        alert('Save failed.');
                    }
                }
            },
            error: function () {
                if (typeof swal === 'function') {
                    swal('Error', 'Network error while saving support details.', 'error');
                } else {
                    alert('Network error.');
                }
            }
        });
    };

    $('#btnSupportSave').on('click', function () {
        SavaDataSupport();
    });

    /* User OTP panels — close */
    $(document).on('click', '.for-master-close', function () {
        saasProfHideUserPanels();
    });

    /* Document inline upload panels */
    window.saasProfShowDocUpload = function (panelId) {
        var $panel = $('#' + panelId);
        if ($panel.length) {
            $('.saas-prof-doc-row').removeClass('is-upload-open');
            $panel.closest('.saas-prof-doc-row').addClass('is-upload-open');
            $panel.slideDown(200);
        }
    };

    function resetProfFileInput($input) {
        var $wrap = $input.closest('.saas-prof-file-input');
        $input.val('');
        $wrap.removeClass('has-file').find('.saas-prof-file-input__text').text('Browse file');
    }

    $(document).on('change', '.saas-prof-file-input__native', function () {
        var fileName = this.files && this.files[0] ? this.files[0].name : 'Browse file';
        var $wrap = $(this).closest('.saas-prof-file-input');
        $wrap.find('.saas-prof-file-input__text').text(fileName);
        $wrap.toggleClass('has-file', this.files && this.files.length > 0);
    });

    $(document).on('click', '.saas-prof-doc-upload__close', function () {
        var panelId = $(this).data('close-panel');
        var showPanelId = $(this).data('show-panel');
        var $panel = $('#' + panelId);
        $panel.hide();
        $panel.closest('.saas-prof-doc-row').removeClass('is-upload-open');
        $panel.find('.saas-prof-file-input__native').each(function () {
            resetProfFileInput($(this));
        });
        if (showPanelId) {
            $('#' + showPanelId).show();
        }
    });

    $(document).ready(function () {
        supportReadonly(true);

        /* Security selects must stay native — full width in flex row */
        $('.saas-prof-sec-control select.profileseclet').each(function () {
            var $sel = $(this);
            $sel.addClass('vm-no-select2');
            if ($sel.data('select2') && typeof $sel.select2 === 'function') {
                try {
                    $sel.select2('destroy');
                } catch (ignore) { /* stale instance */ }
            }
            $sel.next('.select2-container').remove();
        });

        /* Profile image modal — modern file picker label */
        $(document).on('change', '#EditprofileimageModal .saas-prof-file-input__native', function () {
            var fileName = this.files && this.files[0] ? this.files[0].name : 'Browse image';
            var $wrap = $(this).closest('.saas-prof-file-input');
            $wrap.find('.saas-prof-file-input__text').text(fileName);
            $wrap.toggleClass('has-file', this.files && this.files.length > 0);
        });

        $('#EditprofileimageModal').on('hidden.bs.modal', function () {
            var $input = $('#profileImageFile');
            var $wrap = $input.closest('.saas-prof-file-input');
            $input.val('');
            $wrap.removeClass('has-file').find('.saas-prof-file-input__text').text('Browse image');
        });
    });

})(jQuery);
