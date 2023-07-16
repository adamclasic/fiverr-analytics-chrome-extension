var beforeLoad = 15;
var done = true;
var rowsCounter = new Array();
var userGigURL = new Array();
var userNameArray = new Array();
var userListArray = new Array();
var intervalTimer;
var gigURLFirst = new Array();
var gigURLAll = new Array();
var gigURLCounter = new Array();
var requestBudget = "";
    
//AA custom code
let totalQue = 0;
let totalOrders = 0;
let totalPrices = 0;
let totalGigs = 0;
let totalGigsOnPage = 0;
let searchWord = '';

//AA custom code end

$(document).ready(function() {
    //AA custom code

    totalGigs = parseFloat(document.querySelector('.number-of-results').innerText.split(' ')[0].replace(/,/g, ''))
    searchWord = document.querySelector('form.search-form > input').value
    //AA custom code end

    var countPages = 0;
    //getting user permission
    var permission = "";
    var localStorage = 0;
    chrome.storage.local.get(["buyerNameShow"], function(items) {
        permission = items['buyerNameShow'];
        //checking user permission
        if (typeof(permission) == "undefined" || permission == "yes") {
            localStorage = 0;
        } //permission checking end
        else {
            localStorage = 1
        }

    });

    //gig ranking tips
    if ($('body').hasClass('body-mp')) {
        gigRankingTips();
        orderCompletionRatio();
    }



    if ($('body').hasClass('body-db') || $('body').hasClass('body-mp') || $('body').hasClass('layout_service')) {
        if (localStorage == 0) {
            intervalTimer = setInterval(loadBuyerName, 500);
        }
    }
});
var proTipsLoader = 0;
//loading buyer names
function loadBuyerName() {
    //Adding Pro Tips
    if (proTipsLoader == 0) {
        proBuyerRequestTips();
        proTipsLoader++;
    }
    if ($('a').hasClass('js-send-offer')) {
        var i = 0;
        $('a.js-send-offer').each(function() {
            $(this).addClass("load-page");
            var UserString = $(this).attr('data-meta');
            singleUser = JSON.parse(UserString);
            userNameArray[i] = singleUser['username'];
            i++;
        });

        // ============ Getting Sellert Details ============== //
        i = 0;
        var missingCounter = 0;
        $('div.js-db-table tbody tr').each(function() {
            $(this).addClass("loaded-name");
            if (!$(this).hasClass('grey')) {
                var url = "https://www.fiverr.com/" + userNameArray[i];
                $(this).find('td.profile-40').prepend('<a href="' + url + '" class="user-profile-link" style="display:block; text-align:left" target="_blank">' + userNameArray[i] + '</a>');
                i++;
                rowsCounter[missingCounter] = missingCounter;
                missingCounter++;

            } else {
                rowsCounter[missingCounter] = -1;
                missingCounter++;
            }
        }); //clearning interval
        gettingSellertDetails(userNameArray, rowsCounter);
        clearInterval(intervalTimer);
    }
}

//clicking on the load more button
$(document).on('click', '.db-load-more', function() {
    var intervalLoadMore = setInterval(loadBuyerNameMore, 500);
});

function loadBuyerNameMore() {
    var newLength = $('.date').length;
    if (newLength > beforeLoad) {
        var beforeEnd = beforeLoad;
        beforeLoad = beforeLoad + 15;

        clearInterval(loadBuyerNameMore);
        var i = 0;
        $('a.js-send-offer').each(function() {
            if (!$(this).hasClass("load-page")) {
                $(this).addClass("load-page");
                var UserString = $(this).attr('data-meta');
                UserString = JSON.parse(UserString);
                userNameArray[i] = UserString['username'];
                userName = UserString['username'];
                $(this).parents('tr').find('td.profile-40').prepend('<a href="https://www.fiverr.com/' + userName + '" class="user-profile-link" style="display:block; text-align:left" target="_blank">' + userNameArray[i] + '</a>');
                $(this).parents('tr').addClass('loaded-name');
                rowsCounter[i] = beforeEnd + i;
                i++;
            }
        });
        gettingSellertDetails(userNameArray, rowsCounter);
    }
}

// =============== Getting seller details ==================//
function gettingSellertDetails(sellerList1, rowsCounter) {
    if (sellerList1.length == 0 && done) {
        return true;
    } else if (sellerList1.length > 0 && !done) {
        return true;
    } else {
        var singleSeller = sellerList1.shift();
        //getting current row
        var currentRow = rowsCounter.shift();
        if (currentRow == -1) {
            currentRow = rowsCounter.shift();
        }
        $.ajax({
            type: "GET",
            url: "https://www.fiverr.com/" + singleSeller,
            success: function(data) {
                //setting up data
                var part = $('<div />').append(data).find('#perseus-initial-props').text();
                var result = JSON.parse(part);
                settingUpData(result, currentRow);
                gettingSellertDetails(sellerList1, rowsCounter);
            },
            error: function(e) {
                done = false;

            }
        });
    }
}

var counterMax = 0;
// ============= Setting seller details ======================//
function settingUpData(result, currentRow) {
    var userCountry = result.userData.seller_card.user.country;
    var userName = result.userData.seller_card.user.username;
    var userJoin = result.userData.seller_card.user.member_since;
    var date = new Date(userJoin * 1000);
    userJoin = date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
    var reviewsAsBuyer = result.userData.buying_reviews.total_count;

    var reviewsAsBuyer = 0;
    try {
        var reviewsAsBuyer = result.userData.selling_reviews.reviews.length;

    } catch (err) {

    }
    if (reviewsAsBuyer == 0) {
        reviewsAsBuyer = "None";
    }
    var isSellerOrBuyerReviews = result.userData.selling_reviews.reviews_as_seller;

    //is user seller
    var ratingAsSeller = sellerRating = responseTime = "None";
    var isUserSeller = result.userData.seller_card.user.is_seller
    if (isUserSeller == true) {
        ratingAsSeller = result.userData.seller_card.user.rating;
        sellerRating = result.userData.seller_card.user.ratings_count;
        responseTime = result.userData.seller_card.user.response_time;
        responseTime = responseTime + "hrs";
    }
    var userOnline = result.userData.user.status;
    if (userOnline == "active") {
        userOnline = '<div class="circle-online"></div> </div> <div class="lable-buyer-details buyer-status-now"> Online </div>';
    } else {
        userOnline = '<div class="circle-offline"></div> </div> <div class="lable-buyer-details buyer-status-now"> Offline </div>';
    }
    //reviews total points count
    var reviewsPointsAsBuyer = result.userData.selling_reviews.reviews;
    var k = 0;
    for (var i = 0; i < reviewsPointsAsBuyer.length; i++) {
        k = k + reviewsPointsAsBuyer[i].value;

    }
    if (k == 0) {
        k = "None";
    } else {
        k = k / i;
        k = k.toFixed(1);
    }

    if ($(document.body).hasClass('fsa-db-1') && counterMax > 3) {
        $('.db-new-main-table.js-db-table table tbody tr.loaded-name:eq(' + currentRow + ')').after('<tr class="main-row-dynamic fsa-user" ><td colspan="6"><div class="main-row-buyer-details"> <div class="buyer-details-list"> <div class="main-icon-cont tooltip-44"><div class="tooltip-main">Buyer Country</div> <svg class="icon-margin-9" width="12" height="16" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.38338 15.6772C0.842813 9.09472 0 8.41916 0 6C0 2.68628 2.68628 0 6 0C9.31372 0 12 2.68628 12 6C12 8.41916 11.1572 9.09472 6.61662 15.6772C6.31866 16.1076 5.68131 16.1076 5.38338 15.6772ZM6 8.5C7.38072 8.5 8.5 7.38072 8.5 6C8.5 4.61928 7.38072 3.5 6 3.5C4.61928 3.5 3.5 4.61928 3.5 6C3.5 7.38072 4.61928 8.5 6 8.5Z"></path></g><defs><clipPath id="clip0"><rect width="12" height="16"></rect></clipPath></defs></svg> </div> <div class="lable-buyer-details"> ' + userCountry + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-db tooltip-44"> <div class="tooltip-main">Fiverr Joining Date</div><svg class="icon-margin-9" width="12" height="14" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg"><path d="M7 8C9.20938 8 11 6.20937 11 4C11 1.79063 9.20938 0 7 0C4.79063 0 3 1.79063 3 4C3 6.20937 4.79063 8 7 8ZM9.8 9H9.27812C8.58437 9.31875 7.8125 9.5 7 9.5C6.1875 9.5 5.41875 9.31875 4.72188 9H4.2C1.88125 9 0 10.8813 0 13.2V14.5C0 15.3281 0.671875 16 1.5 16H12.5C13.3281 16 14 15.3281 14 14.5V13.2C14 10.8813 12.1187 9 9.8 9Z"></path></svg> </div> <div class="lable-buyer-details"> ' + userJoin + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont review-as-buyer"> <div class="star-icons-buyer"> </div> </div> <div class="lable-buyer-details"> Reviews as Buyer </div> <div class="buyer-reviews-counter"> <span>' + reviewsAsBuyer + ' </span><span>(' + k + ')</span> </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont review-as-buyer"> <div class="star-icons-buyer"> </div> </div> <div class="lable-buyer-details"> Reviews as Seller </div> <div class="buyer-reviews-counter"> <span>' + ratingAsSeller + ' </span><span>(' + sellerRating + ')</span> </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-response-time tooltip-44"> <div class="tooltip-main">Response Time</div><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path><path d="M9 4H7v5h5V7H9V4z"></path></svg> </div> <div class="lable-buyer-details"> ' + responseTime + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-online-offline">' + userOnline + '</div></div><a href="https://fiverrpromotion.net/fiverr-seller-assistant/" target="_blank" class="td-absolute">Premium</a></td></tr>');
    } else {
        $('.db-new-main-table.js-db-table table tbody tr.loaded-name:eq(' + currentRow + ')').after('<tr class="main-row-dynamic" ><td colspan="6"><div class="main-row-buyer-details"> <div class="buyer-details-list"> <div class="main-icon-cont tooltip-44"><div class="tooltip-main">Buyer Country</div> <svg class="icon-margin-9" width="12" height="16" viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.38338 15.6772C0.842813 9.09472 0 8.41916 0 6C0 2.68628 2.68628 0 6 0C9.31372 0 12 2.68628 12 6C12 8.41916 11.1572 9.09472 6.61662 15.6772C6.31866 16.1076 5.68131 16.1076 5.38338 15.6772ZM6 8.5C7.38072 8.5 8.5 7.38072 8.5 6C8.5 4.61928 7.38072 3.5 6 3.5C4.61928 3.5 3.5 4.61928 3.5 6C3.5 7.38072 4.61928 8.5 6 8.5Z"></path></g><defs><clipPath id="clip0"><rect width="12" height="16"></rect></clipPath></defs></svg> </div> <div class="lable-buyer-details"> ' + userCountry + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-db tooltip-44"> <div class="tooltip-main">Fiverr Joining Date</div><svg class="icon-margin-9" width="12" height="14" viewBox="0 0 14 16" xmlns="http://www.w3.org/2000/svg"><path d="M7 8C9.20938 8 11 6.20937 11 4C11 1.79063 9.20938 0 7 0C4.79063 0 3 1.79063 3 4C3 6.20937 4.79063 8 7 8ZM9.8 9H9.27812C8.58437 9.31875 7.8125 9.5 7 9.5C6.1875 9.5 5.41875 9.31875 4.72188 9H4.2C1.88125 9 0 10.8813 0 13.2V14.5C0 15.3281 0.671875 16 1.5 16H12.5C13.3281 16 14 15.3281 14 14.5V13.2C14 10.8813 12.1187 9 9.8 9Z"></path></svg> </div> <div class="lable-buyer-details"> ' + userJoin + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont review-as-buyer"> <div class="star-icons-buyer"> </div> </div> <div class="lable-buyer-details"> Reviews as Buyer </div> <div class="buyer-reviews-counter"> <span>' + reviewsAsBuyer + ' </span><span>(' + k + ')</span> </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont review-as-buyer"> <div class="star-icons-buyer"> </div> </div> <div class="lable-buyer-details"> Reviews as Seller </div> <div class="buyer-reviews-counter"> <span>' + ratingAsSeller + ' </span><span>(' + sellerRating + ')</span> </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-response-time tooltip-44"> <div class="tooltip-main">Response Time</div><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path><path d="M9 4H7v5h5V7H9V4z"></path></svg> </div> <div class="lable-buyer-details"> ' + responseTime + ' </div> </div> <div class="buyer-details-list"> <div class="main-icon-cont buyer-online-offline">' + userOnline + '</div></div></td></tr>');
    }
    counterMax++;
}

// ============= Pro buyer request tips =====================//
function proBuyerRequestTips() {
    $('.db-new-content.db-requests.js-db-cont').prepend('<div class="ticker-wrapper-h"> <div class="heading"><div class="circle-pro"></div> Pro Tips</div> <ul class="news-ticker-h">  </ul></div>');
}

function gigRankingTips() {
    $('.seller-education-wrapper').prepend('<div class="ticker-wrapper-h"> <div class="heading"><div class="circle-pro"></div> Pro Ranking Tips</div> <ul class="news-ticker-h">   </ul></div>');
}

// ============= Checking Order Completion ==================//
function orderCompletionRatio() {
    var orderRatio = $('.seller-performance-wrapper ul.progresses-wrapper li:last .percent-text').text();
    orderRatio = parseFloat(orderRatio);
    if (orderRatio < 90) {
        $('.seller-performance-wrapper ul.progresses-wrapper li:last').append('<a href="https://fiverrpromotion.net/check-fiverr-gig-order-completion-rate/" target="_blank" style="color: #03a9f4;font-size: 13px;margin-top: 10px;text-decoration: underline;">Check No. of required orders for reaching 90%</a>');
    }
}



$(document).ready(function() {
    // ============= On Scroll load remaining gig data ==============//
    if ($('div').hasClass('search_perseus')) {
        $(window).scroll(function(event) {
            var st = $(this).scrollTop();
            if (st > 10 && st < 800) {
                putGigData1();
            } else if (st > 800 && st < 1600) {
                putGigData2();
            } else if (st > 1600 && st < 2400) {
                putGigData3();
            } else if (st > 2400 && st < 2800) {
                putGigData4();
            } else if (st > 2800 && st < 3200) {
                putGigData5();
            } else if (st > 3200 && st < 3600) {
                putGigData6();
            }

        });
    } //scroll function end for gig data

    var putGigData1 = (function() {
        var executed1 = false;
        return function() {
            if (!executed1) {
                executed1 = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();
    var putGigData2 = (function() {
        var executed2 = false;
        return function() {
            if (!executed2) {
                executed2 = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();
    var putGigData3 = (function() {
        var executed3 = false;
        return function() {
            if (!executed3) {
                executed3 = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();
    var putGigData4 = (function() {
        var executed4 = false;
        return function() {
            if (!executed4) {
                executed4 = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();
    var putGigData5 = (function() {
        var executed5 = false;
        return function() {
            if (!executed5) {
                executed5 = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();
    var putGigData6 = (function() {
        var executed6 = false;
        return function() {
            if (!executed6) {
                executed = true;
                for (var i = 0; i <= 7; i++) {
                    gettingGigDetails();
                }
            }
        };
    })();


    // ======================== Adding Data on Buyer Request Page =================//
    if ($('article').hasClass('db-new-content')) {
        var extensionID = chrome.runtime.id;
        $('.db-new-header').prepend('<div class="setting-icon-br"><div class="btn-setting-request"><img src="chrome-extension://' + extensionID + '/images/001-alarm.png"><span>Notification Setting</span></div></div>');
    }
    var getNotification = localStorage.getItem('requestDetail');
    if (getNotification == null) {
        console.log(getNotification);
        var setNotificationSound = 'on';
        var setNotificationRequest = 'on';
        var setNotificationTime = '5 Min';
        var notificationDetail = { 'request-notification': setNotificationRequest, 'sound-request': setNotificationSound, 'notification-time': setNotificationTime };
        localStorage.setItem('requestDetail', JSON.stringify(notificationDetail));
        notificationSetting();
    } else {
        notificationSetting();
    }

    function notificationSetting() {
        var getNotificationData = JSON.parse(localStorage.getItem('requestDetail'));
        var notificationTime = getNotificationData['notification-time'];
        var notificationRequest = getNotificationData['request-notification'];
        var notificationSound = getNotificationData['sound-request'];
        var requestStatus, requestActive;
        var soundStatus, soundActive;
        var timeList;
        if (notificationRequest == 'on') {
            requestStatus = 'checked';
            requestActive = 'active';

        } else if (notificationRequest == 'off') {
            requestStatus = 'unchecked';
            requestActive = '';
        }
        if (notificationSound == 'on') {
            soundStatus = 'checked';
            soundActive = 'active';
        } else if (notificationRequest == 'off') {
            soundStatus = 'unchecked';
            soundActive = '';
        }
        if (notificationTime == '5 Min') {
            timeList = "<li class='active'>5 Min</li><li>10 Min</li><li>15 Min</li><li>20 Min</li><li>30 Min</li>";
        } else if (notificationTime == '10 Min') {
            timeList = "<li>5 Min</li><li class='active'>10 Min</li><li>15 Min</li><li>20 Min</li><li>30 Min</li>";
        } else if (notificationTime == '15 Min') {
            timeList = "<li>5 Min</li><li>10 Min</li><li class='active'>15 Min</li><li>20 Min</li><li>30 Min</li>";
        } else if (notificationTime == '20 Min') {
            timeList = "<li>5 Min</li><li>10 Min</li><li>15 Min</li><li class='active'>20 Min</li><li>30 Min</li>";
        } else if (notificationTime == '30 Min') {
            timeList = "<li>5 Min</li><li>10 Min</li><li>15 Min</li><li>20 Min</li><li class='active'>30 Min</li>";
        }
        var displayAlert = '';
        if ($(document.body).hasClass('fsa-db')) { displayAlert = 'displayNone'; }

        $alert_box = '<div class="alert ' + displayAlert + '"> <div class="icon-box"><div class="alert-icon"><svg viewBox="0 0 24 24"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg></div></div><div class="alert-text">Become a premium member for just $1/month<br> <span><a href="https://fiverrpromotion.net/fiverr-seller-assistant/" target="_blank">View Premium Member Benefits</a></span></div></div>'
        $('.setting-icon-br').after('<div class="notification-popup">' + $alert_box + ' <div class="main-title">Set up your notifications</div><p class="main-desc">Be the first to know about relevant buyer requests.</p><div class="notification-alert"> <section class="toggle-Section"> <div class="switch-box enable-requests"> <p class="label">Enable buyer request notification</p><label class="switch request-toggle ' + requestActive + '" > <input type="checkbox" id="request-notification" name="request-notification" value="' + notificationRequest + '" checked="' + requestStatus + '"> <span class="slider round"></span> </label> </div><div class="switch-box enable-sound"> <p class="label">Enable sound request notification</p><label class="switch soundrequest-toggle ' + soundActive + '"> <input type="checkbox" id="sound-request" name="sound-request" value="' + notificationSound + '" checked="' + soundStatus + '"> <span class="slider round"></span> </label> </div><div class="notification-time"> <div class="notification-time_title">I want to get notified every...</div><ul>' + timeList + '</ul> </div></section> </div><div class="notification-btns"> <button class="update-request push-btn" type="button"> Save </button> <button class="push-btn cancel-request" type="button"> Cancel </button> </div></div>');
    }

    $(document).on('click', '.setting-icon-br .btn-setting-request', function() {
        $(".notification-popup").slideToggle("slow");
        $(this).addClass('active-setting');
    });


    //Cancel function for removing the setting container

    $(document).on('click', '.cancel-request', function() {
        $(".notification-popup").slideUp("slow");
        $('.setting-icon-br').removeClass('active-setting');
    });

    // Update button click
    //request notification info
    $(document).on('click', '.update-request', function() {
        var requesttime = $('#request-notification').val();
        var requestsound = $('#sound-request').val();
        var requesttimeduration = $('.notification-time ul li.active').text();
        var requestDetail = { 'request-notification': requesttime, 'sound-request': requestsound, 'notification-time': requesttimeduration };
        // Put the object into storage
        var testnotification = localStorage.setItem('requestDetail', JSON.stringify(requestDetail));
        // Retrieve the object from storage
        //var getNotificationData2 = JSON.parse(localStorage.getItem('requestDetail'));
        window.location.reload();

    });
    $(document).ready(function() {
        /*

        var newDate = new Date();
        var extensionID = chrome.runtime.id;
        var tipIMG = "<img src='chrome-extension://" + extensionID + "/images/tip-icon.png' />"
        var getTipsDate = localStorage.getItem('TipsDetailDate');
        if (getTipsDate == null || getTipsDate != newDate.getDate()) {

            var UserID = localStorage.getItem('userID');
            $.ajax({
                type: "POST", //or GET
                url: "https://fiverrpromotion.net/wp-content/plugins/fiverr-faverties/newsApi.php",
                data: {
                    user_id: UserID,
                },
                crossDomain: true,
                cache: false,
                async: false,
                success: function(response) {
                    if (response <= 0) {
                        localStorage.removeItem('ActivationKey');
                    }
                }
            });

            //check if news date exist
            $.ajax({
                type: "POST", //or GET
                url: "https://fiverrpromotion.net/wp-content/plugins/fiverr-faverties/newsApi.php",
                data: {
                    getNews: '1',
                },
                crossDomain: true,
                cache: false,
                async: false,
                success: function(response) {
                    response = jQuery.parseJSON(response);
                    var TipsDetail = [];
                    for (var i = 0; i < response.length; i++) {
                        var TipTitle = response[i].tipTitle;
                        var TipUrl = response[i].tipURL;
                        TipsDetail.push([TipTitle, TipUrl]);

                    }
                    var todayDate = newDate.getDate();
                    localStorage.setItem('TipsDetail', JSON.stringify(TipsDetail));
                    localStorage.setItem('TipsDetailDate', todayDate);
                },
                error: function(jxhr) {
                    console.log(jxhr.responseText);
                    //do some thing
                }
            });
            var getTipsDetail = JSON.parse(localStorage.getItem('TipsDetail'));
            setTimeout(function() {
                for (var i = 0; i < getTipsDetail.length; i++) {
                    var Title = getTipsDetail[i][0];
                    var Url = getTipsDetail[i][1];
                    var tipLink = "<li>" + tipIMG + "<a href='" + Url + "' target='_blank'>" + Title + "</a></li>";
                    $("ul.news-ticker-h").append(tipLink);
                }
            }, 3000);
        } else if (getTipsDate == newDate.getDate()) {

            var getTipsDetail = JSON.parse(localStorage.getItem('TipsDetail'));
            setTimeout(function() {
                for (var i = 0; i < getTipsDetail.length; i++) {
                    var Title = getTipsDetail[i][0];
                    var Url = getTipsDetail[i][1];
                    var tipLink = "<li>" + tipIMG + "<a href='" + Url + "' target='_blank'>" + Title + "</a></li>";
                    $("ul.news-ticker-h").append(tipLink);
                }
            }, 3000);

        }
        */
    });






    // TOGGLE SWITCH BUTTONS 
    $(function() {
        $(document).on('click', '.switch input', function() {
            $(this).parent().toggleClass('active');
            // Request Toggle
            if ($(".request-toggle").hasClass("active")) {
                $('#request-notification').attr('checked', true);
                $('#request-notification').val('on');
            } else {
                $('#request-notification').attr('checked', false);
                $('#request-notification').val('off');
            }
            // Sound request Toggle
            if ($(".soundrequest-toggle").hasClass("active")) {
                $('#sound-request').attr('checked', true);
                $('#sound-request').val('on');
            } else {
                $('#sound-request').attr('checked', false);
                $('#sound-request').val('off');
            }
        });


    });
    $(document).on('click', '.notification-time ul li', function() {
        $('.notification-time ul li').removeClass('active');
        $(this).addClass('active');
    });


    // New Buyer request notifications
    var buyerRequestSetting = JSON.parse(localStorage.getItem('requestDetail'));
    if (buyerRequestSetting['request-notification'] == "on") {
        var notifyTiming = buyerRequestSetting['notification-time'];
        var notifyTimer = 300000;
        if (notifyTiming == "5 Min") {
            notifyTimer = 300000;
        } else if (notifyTiming == "10 Min") {
            notifyTimer = 600000;
        } else if (notifyTiming == "15 Min") {
            notifyTimer = 15 * 60000;
        } else if (notifyTiming == "20 Min") {
            notifyTimer = 20 * 60000;
        } else if (notifyTiming == "30 Min") {
            notifyTimer = 30 * 60000;
        }
        var popupInterval = window.setInterval(function() {
            fetchingBuyerRequest();
        }, notifyTimer);
    }



    // =============== Fetching Buyer Request ===============//
    function fetchingBuyerRequest() {
        var NewOffers = [];
        var username = $('.user-info > a').text();
        $.ajax({
            type: "GET",
            url: "https://www.fiverr.com/users/" + username + "/requests",
            success: function(data) {

                var part = $('<div />').append(data).find('.js-main-content > script').text();
                part = part.substring(25);
                var response = JSON.parse(part);
                for (var i = 0; i < response.results.rows.length; i++) {
                    NewOffers[i] = response.results.rows[i].identifier;

                }
                chrome.storage.local.get(["ExistingOffers"], function(items) {
                    var existingOffers = items["ExistingOffers"];
                    if (typeof(existingOffers) == "undefined") {
                        chrome.storage.local.set({ "ExistingOffers": NewOffers.toString() }, function(e) {

                        });

                    } else {
                        chrome.storage.local.get(["ExistingOffers"], function(items2) {
                            var compareOffers = items2["ExistingOffers"];
                            compareOffers = compareOffers.split(',');
                            var newOfferCounter = 0;
                            for (var i = 0; i < NewOffers.length; i++) {
                                if (!compareOffers.includes(NewOffers[i])) {
                                    newOfferCounter++;
                                    console.log(NewOffers[i]);
                                }

                            }
                            if (newOfferCounter > 1) {
                                showNewOffersPopup(newOfferCounter);
                            }


                            //save new offers data
                            var oldOffers = NewOffers.toString();
                            console.log(oldOffers.length);
                            var savingOffers = "";
                            if (oldOffers.length > 8000) {
                                savingOffers = NewOffers.toString();
                            } else {
                                savingOffers = compareOffers.toString() + NewOffers.toString();
                            }
                            chrome.storage.local.set({ "ExistingOffers": savingOffers }, function(e) {});

                        })
                    }
                })

            },
            error: function(e) {

            }
        });
    }


    function showNewOffersPopup(offersCount) {
        $('.popup-new-offer-main').remove();
        var username = $('.user-info > a').text();
        var offerURL = "https://www.fiverr.com/users/" + username + "/requests";
        var extensionID = chrome.runtime.id;
        if ($(document.body).hasClass('fsa-db-1')) {
            return 0;
        }
        $('body').append('<div class="popup-new-offer-main animated animatedFadeInUp fadeInUp"><div class="left-new-offers"><img src="chrome-extension://' + extensionID + '/images/notification.png" class="img-hint-icon"></div><div class="right-new-offers"><div class="hint-main-title"><a href="' + offerURL + '" target="_blank"><span>' + offersCount + '+</span> New Buyer Request are added!</a></div><div class="hint-second-title">New offers are added. Check out now!</div><div class="clear"></div></div><div class="close-offer-popup">CLOSE</div></div>');

        //playing notification voice
        var newReqSound = JSON.parse(localStorage.getItem('requestDetail'));
        newReqSound = newReqSound['sound-request'];
        if (newReqSound == "on") {
            try {
                const audio = new Audio("chrome-extension://" + extensionID + "/images/notification-tone.mp3");
                audio.play();
            } catch (e) {

            }
        }
        //changing favicon
        $('link[rel="shortcut icon"]').remove();
        $('head').append('<link href="chrome-extension://' + extensionID + '/images/favicon-32x32.png" rel="shortcut icon" type="image/x-icon" />');

        setTimeout(function() {
            $('.popup-new-offer-main').remove();
            $('link[rel="shortcut icon"]').remove();
            $('head').append('<link href="https://npm-assets.fiverrcdn.com/assets/@fiverr-private/realtime_notifications/favicon.5b3b346.ico" rel="shortcut icon" type="image/x-icon" />');
        }, 180000);

    }

    //hiding popup
    $(document).on('click', '.close-offer-popup', function() {
        $('.popup-new-offer-main').addClass('hidden');
    });


    // ================= Reviews on Message Box ==================//
    if ($('div').hasClass('inbox_perseus')) {
        var buyerProfileUrl = $('.details-pane .iIlQwX0 a').text();
        buyerProfileUrl = "https://www.fiverr.com/" + buyerProfileUrl;
        loadBuyerReviews(buyerProfileUrl);
    } //end reviews on inbox
    $(document).on('click', '.inbox_perseus_wrapper .contacts-list a.contact', function() {
        var buyerProfileUrl = $(this).find('.user-info strong').text();
        buyerProfileUrl = "https://www.fiverr.com/" + buyerProfileUrl;
        loadBuyerReviews(buyerProfileUrl);
    });


    function loadBuyerReviews(profileURL) {
        $('.reviews-wrapper').remove();
        $.ajax({
            type: "GET",
            url: profileURL,
            success: function(data) {
                var part = $('<div />').append(data).find('.gigs-reviews-panel').html();
                $('aside.details-pane').addClass('user-page-perseus');
                $('head').append('<link rel="stylesheet" href="https://npm-assets.fiverrcdn.com/assets/@fiverr/user_page_v2_perseus/apps/seller_page/index.5b4d8b9f46e3be0b2d53.css"></style>');
                $('aside.details-pane').append(part);
                $('.filter-reviews-select').remove();
                $('aside.details-pane .review-item').css({ 'flex-direction': 'row', 'flex-wrap': 'wrap', 'padding-top': '0px', 'padding-bottom': '14px' });
                $('.details-pane li').css('justify-content', 'left');
                $('#reviews_header_as_buyer').css('padding', '10px 10px');
                $('#reviews_header_as_buyer .details').css("padding-bottom", '0px');
                $('aside.details-pane .reviewer-details').css({ 'flex-direction': 'column', 'flex-wrap': 'wrap', 'display': 'flex', 'align-items': 'flex-start', 'padding': '4px 10px' });
                $('aside.details-pane .review-description').css({ 'margin-left': '-40px', 'margin-top': '-1px', 'flex': '0 0 100%' });
                $('aside.details-pane .summarize time').css({ 'margin-left': '-40px', 'font-size': '12px', 'margin-top': '-6px', 'display': 'block' });
                $('aside.details-pane .reviews-package .load-more-wrapper').remove();
                $('section.gigs-wrapper, .reviews-header .summary, .helpful-thumbs').remove();
                $('.reviews-wrapper').css('padding', '10px');
                $('.reviews-package .review-list .review-item').css("border", "0px");

            },
            error: function(e) {}
        });
    }

    // =============== Adding details on the gig page =====================//
    if ($('div.gig-page-wrapper').attr('data-username') == $('.user-info > a').text()) {
        var extensionID = chrome.runtime.id;
        $('.gig-page').before('<div class="gig-page-data"><a href="https://fiverrpromotion.net/check-fiverr-gig-ranking/" target="_blank">\
		<img src="chrome-extension://' + extensionID + '/images/001-ranking.png">Gig Ranking</a>\
		<a href="https://fiverrpromotion.net/" target="_blank"><img src="chrome-extension://' + extensionID + '/images/002-promotion-1.png">Promote Gig<span> (Free)</span></a>\
		<a href="https://fiverrpromotion.net/free-fiverr-gig-favorites/" target="_blank"><img src="chrome-extension://' + extensionID + '/images/003-promotion.png">Gig Favorites<span> (Premium)</span></a>\
		</div>');
    }



}); //End of main (ready)

//=============  REQUESTS SEEN AND UNSEEN FUNCTIONALITY ========//
$(document).ready(function() {
    setTimeout(requestSeenUnseen, 1000);
});
$(document).on('click', '.db-load-more', function() {
    setTimeout(requestSeenUnseen, 1000);
});

function requestSeenUnseen() {

    var existingOffersList = JSON.parse(localStorage.getItem('existingOffersList'));
    var requestIdList = [];
    $('.db-requests div.js-db-table tbody tr').each(function() {
        var requestID = $(this).attr('data-id');

        if (typeof(requestID) != 'undefined') {
            if (existingOffersList == null) {

                requestIdList.push(requestID);
            } else {
                var checkOffer = $.inArray(requestID, existingOffersList);
                if (checkOffer != -1) {
                    if (!$(this).hasClass('Seen-UnseenOffer')) {
                        $(this).addClass('Seen-UnseenOffer');
                        $(this).css('background-color', '#eeffee');
                        $(this).append('<span class="Seen-UnseenOffertd">Seen</span>');
                    }

                } else {
                    if (!$(this).hasClass('Seen-UnseenOffer')) {
                        $(this).addClass('Seen-UnseenOffer');
                        $(this).append('<span class="Seen-UnseenOffertd">New</span>');
                        existingOffersList.push(requestID);
                    }

                }

            }
        }
    });
    if (existingOffersList == null) {
        localStorage.setItem('existingOffersList', JSON.stringify(requestIdList));
    } else {
        localStorage.setItem('existingOffersList', JSON.stringify(existingOffersList));
    }


}

// ==================== Gig Details ================= //
if ($('div').hasClass('search_perseus')) {
    var j = 0;
    $('.gig-card-layout  a:nth-of-type(2)').each(function() {
        gigURLFirst[j] = "https://www.fiverr.com" + $(this).attr('href');
        gigURLAll[j] = "https://www.fiverr.com" + $(this).attr('href');
        gigURLCounter[j] = j;
        j++;
    });
    if (gigURLFirst.length > 0) {
        for (var i = 0; i <= 7; i++) {
            gettingGigDetails();
        }

    }
}
if ($('div').hasClass('user-page-perseus')) {
    var j = 0;
    $('.gig-card-layout h3 a').each(function() {
        gigURLFirst[j] = "https://www.fiverr.com" + $(this).attr('href');
        gigURLAll[j] = "https://www.fiverr.com" + $(this).attr('href');
        gigURLCounter[j] = j;
        j++;
    });
    for (var i = 0; i <= j; i++) {
        gettingGigDetails();
    }
}

function putGigData(result, gigNum) {
    var tags = result.tags.tagsGigList;
    var tagHTML = "";
    for (var i = 0; i < tags.length; i++) {
        tagHTML = tagHTML + '<div class="tag-list-gig-44">' + tags[i].name + '</div>';
    }
    $('.gig_listings-package.listing-container .gig-card-layout:eq(' + gigNum + ') .gig-wrapper div.basic-gig-card').append('<div class="tags-list-gig">' + tagHTML + '</div>');

    // Data with icon
    var runningOrders = result.overview.gig.ordersInQueue;
    var totalCompOrders = result.overview.gig.ratingsCount;
    var sellerResTime = result.sellerCard.responseTime;
    var sellerCountry = result.sellerCard.countryCode;
    let regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    sellerCountry = regionNames.of(sellerCountry);
    var totalFav = result.topNav.gigCollectedCount;
    var extensionID = chrome.runtime.id;
    $('.gig_listings-package.listing-container .gig-card-layout:eq(' + gigNum + ') .gig-wrapper div.basic-gig-card').append('<div class="rows-custom-data">\
	<div class="custom-data-column data-column-1 tooltip-44"><div class="tooltip-main">Running orders</div>\
	<img src="chrome-extension://' + extensionID + '/images/001-checkout.png">\
	<div class="count">' + runningOrders + '</div></div>\
	<div class="custom-data-column data-column-2 tooltip-44"><div class="tooltip-main">Completed orders</div>\
	<img src="chrome-extension://' + extensionID + '/images/002-shopping-bag.png">\
	<div class="count">' + totalCompOrders + '</div></div>\
	<div class="custom-data-column data-column-3 tooltip-44"><div class="tooltip-main">Average response time</div>\
	<img src="chrome-extension://' + extensionID + '/images/001-clock.png">\
	<div class="count">' + sellerResTime + 'hrs</div></div>\
	<div class="custom-data-column data-column-4 tooltip-44"><div class="tooltip-main">Seller Country</div>\
	<img src="chrome-extension://' + extensionID + '/images/002-placeholder.png">\
	<div class="count">' + sellerCountry + '</div></div>\
    <div class="custom-data-column data-column-5 tooltip-44"><div class="tooltip-main">Total Likes</div>\
	<img src="chrome-extension://' + extensionID + '/images/003-heart.png">\
	<div class="count">' + totalFav + '</div></div>\
	</div>');
    //$('.gig_listings-package.listing-container .gig-card-layout:eq(' + gigNum + ') .gig-wrapper div.basic-gig-card').append('<span class="total-fav-gig">' + totalFav + '</span>');
    
    //AA custom code
    totalQue = totalQue + runningOrders
    totalOrders = totalOrders + totalCompOrders
    totalPrices = totalPrices + result.packages.packageList[0].price 
    totalGigsOnPage++
    console.log(
        searchWord.replaceAll(' ', '_'),
        totalOrders,
        (totalPrices/100),
        totalGigs,
        (totalGigsOnPage),
        totalQue,
    );
    //AA custom code end

} //end of putGigData function
function gettingGigDetails() {
    if (gigURLFirst.length > 0) {
        var singleGig = gigURLFirst.shift();
        var currentGigNum = gigURLCounter.shift();
        $.ajax({
            type: "GET",
            url: singleGig,
            success: function(data) {
                //setting up data
                var part = $('<div />').append(data).find('#perseus-initial-props').text();
                var result = JSON.parse(part);
                putGigData(result, currentGigNum);
                // gettingGigDetails();
            },
            error: function(e) {
                done = false;

            }
        });
    } else {
        return 0;
    }
} //end of gettingGigDetails function

var intervalId = window.setInterval(function() {
    // loadBuyerName();
}, 5000)

if (localStorage.getItem('ActivationKey')) {
    __ = 'fsa-db';
    $(document.body).addClass(__);
} else {
    ___ = 'fsa-db-1'
    $(document.body).addClass(___);
}


// ==================== User Key Activation popup  ================= //
jQuery(document).ready(function() {
    var keyURL = window.location.href;
    var activation_key = VarificationKey('activation-key', keyURL);
    var UserId = VarificationKey('id', keyURL);
    if (activation_key != '') {
        $('body').append('<div class="fsaAcitivationPopUp"> <div class="innerSection"> <h2> Fiverr Seller Assistant PRO is Activating... </h2> <div class="icon"><div class="ring">ACTIVATING<span></span></div> </div></div></div>');
        $.ajax({
            type: "POST", //or GET
            url: "https://fiverrpromotion.net/wp-content/plugins/fiverr-faverties/newsApi.php",
            data: {
                key: activation_key,
                id: UserId,
            },
            crossDomain: true,
            cache: false,
            async: false,
            success: function(response) {
                console.log(response);
                if (response == 'true') {
                    localStorage.setItem('userID', UserId);
                    localStorage.setItem('ActivationKey', activation_key);
                    var verify_icon = '<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"/><path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621"/></g></svg>';
                    setTimeout(function() {
                        $('.fsaAcitivationPopUp .ring').css('display', 'none');
                        $('.fsaAcitivationPopUp h2').text('Congratulation, Extension has been Activated');
                        $('.fsaAcitivationPopUp .icon').append(verify_icon);
                    }, 3000);
                    setTimeout(function() {
                        window.location = window.location.href.split("?")[0];
                        window.location.href = "https://www.fiverr.com/seller_dashboard";
                    }, 6000);
                } else {

                    var warning = '<div class="warning_error"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ff3333"><path d="M0 0h24v24H0z" fill="none"/><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg></div>';
                    setTimeout(function() {
                        $('.fsaAcitivationPopUp .ring').css('display', 'none');
                        $('.fsaAcitivationPopUp h2').text('Ops! This Link has been Expire, Please try again');
                        $('.fsaAcitivationPopUp .icon').append(warning);
                    }, 3000);

                    setTimeout(function() {
                        window.location = window.location.href.split("?")[0];
                    }, 4000);
                }
            },
        });
    }
});
// URL variable get function 
function VarificationKey(name, url) {
    let urlSingle = new URL(url);
    let searchParams = new URLSearchParams(urlSingle.search);
    var r = searchParams.get(name);
    if (r != null) {
        return r;
    } else {
        return "";
    }
}