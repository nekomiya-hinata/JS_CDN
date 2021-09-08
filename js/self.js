function wx() {
    ali.style.marginTop = '0';
    pay1.style.backgroundColor = 'rgba(67,206,116,0.5)';
    pay2.style.backgroundColor = 'rgba(55,137,232,0)';
}

function zfb() {
    ali.style.marginTop = '-224px';
    pay1.style.backgroundColor = 'rgba(67,206,116,0)';
    pay2.style.backgroundColor = 'rgba(55,137,232,0.5)';
}

$("#change_bar").click(function () {
    let body = $("body");
    if ($(window).width() > 1024) {
        if (body.hasClass("sidebar-mini")) {
            body.removeClass("sidebar-mini");
        } else {
            body.addClass("sidebar-mini");
        }
    } else {
        body.attr("class", "sidebar-show");
    }
})

function hasScrollbar() {
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
}

$(window).resize(function () {
    let body = $("body");
    let min_width = 1024;
    if ($(window).width() <= min_width) {
        if (body.hasClass("sidebar-show")) {
            body.removeClass("sidebar-show");
        }
        if (body.hasClass("sidebar-mini")) {
            body.removeClass("sidebar-mini");
        }
        body.addClass("sidebar-gone");
    } else {
        body.removeClass("sidebar-gone sidebar-show");
    }
})
$(document).ready(function () {
    let body = $("body");
    if ($(window).width() <= 1024) {
        body.addClass("sidebar-gone");
    }
    $(document).bind("click", function (e) {
        if (body.hasClass("sidebar-show")) {
            if ($(e.target).closest(".main-sidebar").length === 0 && $(e.target).closest("#change_bar").length !== 1) {
                $("body").attr("class", "sidebar-gone");
            }
        }
    })
})