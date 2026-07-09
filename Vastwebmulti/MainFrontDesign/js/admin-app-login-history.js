/**
 * ADMIN — App Login History report
 */
(function (window, document, $) {
    'use strict';

    function initDates() {
        if (typeof window.initAdminReportDateForm !== 'function') {
            return;
        }
        var formId = '';
        if (document.getElementById('appLoginHistoryForm')) {
            formId = '#appLoginHistoryForm';
        } else if (document.getElementById('unlockedIdForm')) {
            formId = '#unlockedIdForm';
        } else if (document.getElementById('webFailedLoginForm')) {
            formId = '#webFailedLoginForm';
        }
        if (formId) {
            window.initAdminReportDateForm(formId);
        }
    }

    function initDataTable() {
        if (!$ || !$.fn || !$.fn.DataTable) {
            return;
        }
        var $table = $('#example');
        if (!$table.length) {
            return;
        }
        if ($.fn.dataTable.isDataTable($table[0])) {
            $table.DataTable().destroy();
        }
        $table.DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5',
                'print'
            ],
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            order: [],
            responsive: false,
            autoWidth: false
        });
    }

    function bindLocationModal() {
        if (!$) {
            return;
        }
        $(document).off('click.vmAppLoginLoc', '.vm-app-login-loc-btn').on('click.vmAppLoginLoc', '.vm-app-login-loc-btn', function (e) {
            e.preventDefault();
            var lat = $(this).data('lat');
            var lng = $(this).data('lng');
            if (typeof window.viewlocation === 'function') {
                window.viewlocation(lat, lng);
            }
        });
    }

    function bindUnlockButtons() {
        if (!$) {
            return;
        }
        $(document).off('click.vmUnlockUser', '.vm-unlock-user-btn').on('click.vmUnlockUser', '.vm-unlock-user-btn', function (e) {
            e.preventDefault();
            var userId = $(this).data('user-id');
            if (userId && typeof window.RenivalId === 'function') {
                window.RenivalId(userId);
            }
        });
    }

    function init() {
        initDates();
        initDataTable();
        bindLocationModal();
        bindUnlockButtons();
    }

    window.vmAppLoginHistoryInit = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document, window.jQuery);
