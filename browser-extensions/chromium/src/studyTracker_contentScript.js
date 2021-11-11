const STUDY_TRACKER_UPDATE_INTERVAL = 60000 * 5;

const COURSE_DETERMINANT_DIVS = {
    "docs.google.com": {type: "class", string: "docs-title-input"},
}

function ifStrArrAppearInString(sourceStr, toFindArr){
    if (toFindArr.some(str.includes.bind(sourceStr))) {
        // There's at least one
        return true
    }
    return false
}


function parseCourseId(elem){
    let elemText = elem.innerText;
    for([course_id, stringArr] in Object.entries(window.identifierStrs)){
        if(ifStrArrAppearInString(elemText, stringArr)) return course_id
        else return -1 // -1 means other for session type
    }
}

window.addEventListener("load", () => {
    chrome.storage.sync.get(["loggedIn", "trackSites", "updateInterval", "courseDeterminantDiv", "identifierStrs"], function(items){
        console.log(items)
        if(items.hasOwnProperty("loggedIn") && items.hasOwnProperty("trackSites")){
            let currentSite = window.location.hostname;
            if(!items["trackSites"].includes(currentSite)) return;

            if(items.hasOwnProperty("identifierStrs")) window.identifierStrs = items.identifierStrs

            let determinantDiv = null;
            if(COURSE_DETERMINANT_DIVS.hasOwnProperty(currentSite)){
                switch(COURSE_DETERMINANT_DIVS[currentSite].type){
                case "class":
                    determinantDiv = document.getElementsByClassName(COURSE_DETERMINANT_DIVS[currentSite].string)[0]
                    break;
                case "id":
                    determinantDiv = document.getElementById(COURSE_DETERMINANT_DIVS[currentSite].string)
                    break;
                }
            }
            if(determinantDiv == null || !determinantDiv) return;
            else window.courseDeterminantDiv = determinantDiv

            if(items.updateInterval) window.studyTracker_updateInterval = items.updateInterval;
            else window.studyTracker_updateInterval = STUDY_TRACKER_UPDATE_INTERVAL

            studyTracker_initializeListeners();
        }
    })
})

function studyTracker_initializeListeners() {
    window.anyAction = true;
    
    let sendPing = () => {
        if(window.anyAction == true){
            let currentCourseId = parseCourseId(window.courseDeterminantDiv);
            chrome.runtime.sendMessage({
                type: "ping",
                courseId: currentCourseId,
            })
            console.log("study_tracker: sent ping")
        }
        window.anyAction = false;
    }
    sendPing();
    setInterval(sendPing, window.studyTracker_updateInterval);


    let onAction = (e) => {
        // if(e.type == "scroll");
        // else if(e.type == "keydown");
        window.anyAction = true;
    }
    let studyTracker_onKeyDown = (e) => onAction(e);
    let studyTracker_onScroll = (e) => onAction(e);


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