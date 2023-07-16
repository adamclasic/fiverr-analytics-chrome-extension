$(document).ready(function() {
    //checking user permission
    var permission = "";
    chrome.storage.local.get(["ActivationKey"], function(items) {
        memberType = items['ActivationKey'];
        if (memberType == null) {
            $('.banner-text').text("Activate extension from admin panel");
            $('.btn-link-ext').text("Activate");
            $('.btn-link-ext').attr('href', 'https://fiverrpromotion.net/my-account/subscription/');
        }
    });
});