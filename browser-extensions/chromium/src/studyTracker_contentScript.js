 const STUDY_TRACKER_UPDATE_INTERVAL = 60000 * 5;

window.addEventListener("load", () => {
    chrome.storage.local.get("loggedIn", function(){
        
    })
    chrome.storage.sync.get(["trackSites", "updateInterval"], function(items){
        console.log(items)
        let currentSite = window.location.hostname;
        if(items["trackSites"].includes(currentSite)){
            if(items.updateInterval) window.studyTracker_updateInterval = items.updateInterval;
            else window.studyTracker_updateInterval = STUDY_TRACKER_UPDATE_INTERVAL
            studyTracker_initializeListeners();
        }
    });
})

function studyTracker_initializeListeners() {
    window.anyAction = false;

    setInterval(() => {
        if(window.anyAction == true){

        }
        window.anyAction = false;
    }, window.studyTracker_updateInterval);

    let onAction = (e) => {
        if(e.type == "scroll");
        else if(e.type == "keydown");
        
        window.anyAction = true;
    }
    let studyTracker_onKeyDown = (e) => onAction(e);
    let studyTracker_onScroll = (e) =>  onAction(e);

    if(window.location.hostname == "docs.google.com"){
        let iframe = document.getElementsByClassName('docs-texteventtarget-iframe')[0];
        let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
        innerDoc.addEventListener("keydown", (e) => {
            studyTracker_onKeyDown(e);
        });
    }else{
        document.addEventListener("keydown", (e) => {
            studyTracker_onKeyDown(e);
        });
        document.addEventListener("scroll", (e) => {
            studyTracker_onScroll(e);
        });
    }
}