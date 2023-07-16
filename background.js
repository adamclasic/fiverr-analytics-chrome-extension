chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({ url: "https://fiverrpromotion.net/promotion/" }, function() {})
})