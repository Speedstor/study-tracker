
//  Usage:
//  PERSISTENT Storage - Globally ------------------------------
//  Save data to storage across their browsers...

(function() {
    // receives message from popup script
    chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
        if(message.type == "cloud-set"){
            chrome.storage.sync.set({ "yourBody": "myBody" }, function(){
                //  A data saved callback omg so fancy
            });
        }else if(message.type == "cloud-get"){
            chrome.storage.sync.get(/* String or Array */["yourBody"], function(items){
                //  items = [ { "yourBody": "myBody" } ]
            });
        }else if(message.type == "local-set"){
            chrome.storage.local.set({ "phasersTo": "awesome" }, function(){
                //  Data's been saved boys and girls, go on home
            });
        }else if(message.type == "local-get"){
            chrome.storage.local.get(/* String or Array */["phasersTo"], function(items){
                //  items = [ { "phasersTo": "awesome" } ]
            });
        }
        // else if(message.type == "getDeterminantDiv"){
        //     let hostname = message.hostname;
        // }


        // if (mssage.type == "ping") {
            // sends response back to popup script
            // sendResponse({pong: "goodbye"});
    
            // sends response to content script
            // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //   chrome.tabs.sendMessage(tabs[0].id, { pong: true } );
            // });
        // } 
    });
})();