function clearButton() {
    let button = $("#topup-confirm");
    button.removeAttr("disabled");
    button.empty();
    button.append("立即捐赠");
}

// 获取指定名称的cookie
function getCookie(name) {
    var strcookie = document.cookie;//获取cookie字符串
    var arrcookie = strcookie.split("; ");//分割
    //遍历匹配
    for (let i = 0; i < arrcookie.length; i++) {
        const arr = arrcookie[i].split("=");
        if (arr[0] === name) {
            return arr[1];
        }
    }
    return null;
}

// 判断移动设备
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isWeixin() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) !== null && ua.match(/MicroMessenger/i)[0] === 'micromessenger') {
        return 1;
    }
    return 0;
}

// 判断是否安卓QQ浏览器
function isQQAndroid() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/QQ/i) != null && ua.match(/QQ/i)[0] === 'qq' && ua.match(/Android/i)[0] === 'android') {
        return 1;
    }
    return 0;
}

$('#top-up').click(function () {
    $('#main-page').hide();
    $('#topup-page').show();
})
$('#back-to-main').click(function () {
    $('#topup-page').hide();
    $('#main-page').show();
})
$('#topup-confirm').click(function () {
    let button = $("#topup-confirm");
    button.empty();
    button.append("<span class=\"spinner-grow spinner-grow-sm\" role=\"status\" aria-hidden=\"true\"></span> Loading...");
    button.prop("disabled", "disabled");

    let month = $("#month").val();
    if (month === "") {
        alert("月数不能为空，请重新输入！");
        clearButton();
        return false;
    }
    let mobile = isMobile();
    $.ajax({
        url: "/code/precreate",
        method: "post",
        dataType: "json",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify({
            month: month,
            mobile: mobile,
            info: $("#info").val(),
            device: navigator.userAgent
        }),
        success: function (data) {
            if (data.code === 200) {
                let qrUrl;
                if (getCookie("payId") != null && data.message === "exist") {
                    qrUrl = getCookie("qrCode");
                } else {
                    qrUrl = data.result.qrCode;
                }
                $("#money1").text(month * 2.0);

                if (mobile && !isWeixin() && !isQQAndroid()) {
                    // 手机端且不是微信浏览器且不是安卓QQ时支持一键打开支付宝
                    $("#qrmobile").css("display", "none");
                    $("#startApp").css("display", "block");
                    $("#startApp").attr("href", qrUrl);
                }
                new QRCode(document.getElementById("qr-pic"), {
                    text: qrUrl,
                    width: 160,
                    height: 160
                });
                $("#payCodeModel").modal("show");
            } else {
                swal.fire({
                    title: '出错了',
                    html: data.message,
                    icon: 'error'
                });
                clearButton();
            }
        },
        error: function () {
            swal.fire({
                title: '出错了',
                text: '系统内部出错，请重试或联系管理员',
                icon: 'error'
            });
            clearButton();
        }
    })
})

let task;

function judgeState() {
    $.ajax({
        url: "/code/payquery/" + getCookie("payId"),
        method: "get",
        success: function (data) {
            if (data.success === true) {
                if (data.result === 1) {
                    clearInterval(task);
                    task = null;
                    swal.fire({
                        title: '支付结果',
                        text: "恭喜您已成功支付 " + Number($("#month").val() * 2.0).toFixed(2) + " 元，感谢您的捐赠，请查收通知邮件，若长时间未收到请检查垃圾邮件或进行反馈！",
                        icon: 'success'
                    }).then(function () {
                        let notice = $("#btn-notice");
                        notice.empty();
                        notice.append("支付完成！");
                        window.location = '/code';
                    });
                }
            }
        }
    });
}

let modal = $('#payCodeModel');

modal.on('shown.bs.modal', function () {
    clearButton();
    $("#btn-notice").append("<span class=\"spinner-grow spinner-grow-sm\" role=\"status\" aria-hidden=\"true\"></span> 等待支付...");
    task = setInterval(function () {
        judgeState()
    }, 2000);
})

modal.on('hidden.bs.modal', function () {
    $("#btn-notice").empty();
    if (task != null)
        clearInterval(task);
})

//  分页相关
let page;

$.ajax({
    method: 'get',
    url: "/code/list",
    dataType: "json",
    success: function (data) {
        page = new Vue({
            el: '#payInfo',
            data: {
                info: data, active_page: '', changePage: ''
            },
            watch: {
                info: function () {
                    this.$nextTick(() => {
                        $(".page-link:contains(" + page.active_page + ")").parent().removeClass("active");
                        $(".page-link:contains(" + page.changePage + ")").parent().addClass("active");
                    });
                }
            }
        });
        $(".page-item:first").addClass("active");
    }
})

function paging(cp) {
    let changePage;
    let active_page = $(".active>.page-link").text();
    switch (cp) {
        case "pre":
            changePage = page.info.prePage;
            break;
        case "next":
            changePage = page.info.nextPage;
            break;
        case "first":
            changePage = 1;
            break;
        case "last":
            changePage = page.info.pages;
            break;
        default:
            changePage = cp.text();
    }
    $.ajax({
        method: 'get',
        url: "/code/list",
        dataType: "json",
        data: {pageNo: changePage},
        success: function (data) {
            page.info = data;
            page.active_page = active_page;
            page.changePage = changePage;
        }
    });
}