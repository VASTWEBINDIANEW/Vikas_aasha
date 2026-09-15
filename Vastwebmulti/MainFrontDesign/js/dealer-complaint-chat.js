/**

 * Dealer complaint chat — compose, auto-scroll, live refresh

 */

(function (window, document) {

    "use strict";



    var pollTimer = null;

    var lastMessageHash = "";



    function $(sel) {

        return document.querySelector(sel);

    }



    function esc(value) {

        return String(value == null ? "" : value)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;");

    }



    function formatStatus(sts) {

        if (sts === "Open") {

            return ' <span class="saas-dealer-complaint-status-open">Open</span>';

        }

        return "";

    }



    function buildMessagesHtml(items) {

        if (!items || !items.length) {

            return '<p class="saas-dealer-complaint-empty text-muted text-center">No messages yet. Send your first complaint using the form.</p>';

        }

        var html = "";

        for (var i = 0; i < items.length; i++) {

            var item = items[i];

            if (item.rdate) {

                html += '<div class="saas-chat-bubble saas-chat-bubble--in clearfix" data-id="' + esc(item.idno) + '">';

                html += '<div class="saas-chat-bubble-head"><strong>You</strong> <i class="far fa-clock saas-chat-time-ico" aria-hidden="true"></i> ' + esc(item.rdate) + formatStatus(item.sts) + "</div>";

                html += '<div class="saas-chat-bubble-body">' + esc(item.complant) + "</div></div>";

            }

            if (item.resdate) {

                html += '<div class="saas-chat-bubble saas-chat-bubble--out clearfix" data-id="' + esc(item.idno) + '">';

                html += '<div class="saas-chat-bubble-head"><strong>Admin</strong> <i class="far fa-clock saas-chat-time-ico" aria-hidden="true"></i> ' + esc(item.resdate) + "</div>";

                html += '<div class="saas-chat-bubble-body">' + esc(item.response) + "</div></div>";

            }

        }

        return html;

    }



    function messagesHash(items) {

        if (!items || !items.length) {

            return "0";

        }

        var parts = [];

        for (var i = 0; i < items.length; i++) {

            var x = items[i];

            parts.push(String(x.idno) + "|" + (x.rdate || "") + "|" + (x.resdate || "") + "|" + (x.sts || ""));

        }

        return parts.join(";");

    }



    function scrollMessagesToBottom(force) {

        var box = $("#dealerComplaintMessages");

        if (!box) {

            return;

        }

        var nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 120;

        if (force || nearBottom) {

            box.scrollTop = box.scrollHeight;

        }

    }



    function updateOpenBadge(openCount) {

        var badge = $("#dealerComplaintOpenBadge");

        if (!badge) {

            return;

        }

        var n = parseInt(openCount, 10);

        if (isNaN(n) || n <= 0) {

            badge.style.display = "none";

            badge.textContent = "0 open";

            badge.classList.add("is-zero");

            return;

        }

        badge.style.display = "";

        badge.textContent = n + (n === 1 ? " open" : " open");

        badge.classList.remove("is-zero");

    }



    function refreshDealerComplaintMessages(silent) {

        var url = window.dealerComplaintMessagesUrl;

        if (!url || !window.jQuery) {

            return;

        }

        window.jQuery.ajax({

            type: "GET",

            url: url,

            dataType: "json",

            cache: false,

            success: function (data) {

                var items = data && data.messages ? data.messages : [];

                var hash = messagesHash(items);

                if (hash === lastMessageHash) {

                    return;

                }

                lastMessageHash = hash;

                var box = $("#dealerComplaintMessages");

                if (box) {

                    box.innerHTML = buildMessagesHtml(items);

                    scrollMessagesToBottom(!silent);

                }

                if (data && data.openCount != null) {

                    updateOpenBadge(data.openCount);

                    if (typeof window.syncDealerTopbarChatBadge === "function") {

                        window.syncDealerTopbarChatBadge(data.openCount);

                    }

                }

            }

        });

    }



    function bindMobileComposeToggle() {

        var btn = $("#saasDealerComplaintToggleCompose");

        var card = $("#saasDealerComplaintComposeCard");

        if (!btn || !card) {

            return;

        }

        btn.addEventListener("click", function () {

            card.classList.toggle("is-collapsed");

        });

    }



    function bindComplaintForm() {

        var form = $("#dealerComplaintForm");

        if (!form) {

            return;

        }

        form.addEventListener("submit", function (e) {

            var textarea = $("#message");

            var text = textarea ? String(textarea.value || "").trim() : "";

            if (!text) {

                e.preventDefault();

                if (typeof window.swal === "function") {

                    window.swal("Message required", "Please enter a complaint message before sending.", "warning");

                }

                return false;

            }

            var btn = $("#dealerComplaintSendBtn");

            if (btn) {

                btn.disabled = true;

            }

            return true;

        });

    }



    function startPolling() {

        if (pollTimer) {

            clearInterval(pollTimer);

        }

        pollTimer = window.setInterval(function () {

            refreshDealerComplaintMessages(true);

        }, 15000);

    }



    function bootDealerComplaintChat() {

        if (typeof window.refreshDealerChatBadge === "function") {

            window.refreshDealerChatBadge();

        }

        var box = $("#dealerComplaintMessages");

        if (box) {

            var bubbles = box.querySelectorAll(".saas-chat-bubble");

            lastMessageHash = "init-" + bubbles.length;

        }

        bindMobileComposeToggle();

        bindComplaintForm();

        scrollMessagesToBottom(true);

        refreshDealerComplaintMessages(true);

        startPolling();

        document.addEventListener("visibilitychange", function () {

            if (!document.hidden) {

                refreshDealerComplaintMessages(false);

            }

        });

    }



    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", bootDealerComplaintChat);

    } else {

        bootDealerComplaintChat();

    }



    window.refreshDealerComplaintMessages = refreshDealerComplaintMessages;

})(window, document);


