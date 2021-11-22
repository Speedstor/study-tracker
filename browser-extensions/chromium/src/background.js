const STUDY_TRACKER_API_HREF = "http://127.0.0.1:8000/api";

window.addEventListener("load", function(){
    updateSettingsFetch()
})

function updateSettingsFetch(){
    fetch(STUDY_TRACKER_API_HREF+"/checkLogin").then((response)=>response.json()).then((responseJson)=>{
        chrome.storage.sync.set({loggedIn: responseJson["status"]})
        if(!responseJson["status"]){
            //TODO:: show to have user login
            
            return
        }
        fetch(STUDY_TRACKER_API_HREF+"/extensionSettings").then((response)=>response.json()).then((responseJson)=>{
            chrome.storage.sync.set({
                trackSites: responseJson.trackSites,
                identifierStrs: responseJson.identifierStrs,
                courses: responseJson.courses,
                "lastUpdate": new Date().getTime(),
            })

            window.trackSites = responseJson.trackSites
            window.identifierStrs = responseJson.identifierStrs
            window.courses = responseJson.courses

            // sends response to content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log(tabs)
                chrome.tabs.sendMessage(tabs[0].id, { type: "updateIdentifierStrs", identifierStrs: window.identifierStrs} );
            });
        })
    })
}

function updateSettings(responseJson){
    window.trackSites = responseJson.trackSites
    window.identifierStrs = responseJson.identifierStrs
    window.courses = responseJson.courses
    // sends response to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log(tabs)
        chrome.tabs.sendMessage(tabs[0].id, { type: "updateIdentifierStrs", identifierStrs: window.identifierStrs} );
    });
}

(function() {
    // receives message from popup script
    chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
        if (message.type == "ping") {
            if(message.hasOwnProperty("courseId")){
                fetch(STUDY_TRACKER_API_HREF+"/ping", {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: "course_id="+message.courseId,
                }).then((response)=>response.json()).then((responseJson)=>{
                    //pass
                })
                sendResponse({pong: "sent"});
            }else{
                sendResponse({pong: "need courseId"});
            }
        }else if(message.type == "updateSettings"){
            updateSettings(message.responseJson)
        }else if(message.type == "getIdentifierStrs"){
            sendResponse({identifierStrs: window.identifierStrs});
        }
    });
})();