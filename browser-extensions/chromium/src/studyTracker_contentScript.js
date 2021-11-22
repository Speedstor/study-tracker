const STUDY_TRACKER_UPDATE_INTERVAL = 60000 * 2;
window.studyTracker_updateInterval = STUDY_TRACKER_UPDATE_INTERVAL
const INDICATOR_CIRCLE_COLOR_GREEN = "#00d100";
const INDICATOR_DIV_BACKGROUND_GREEN = "#96d596e0";
const INDICATOR_DIV_BACKGROUND_GREY = "#abababe0"
const INDICATOR_CIRCLE_COLOR_GREY = "#898989"

const COURSE_DETERMINANT_DIVS = {
    "docs.google.com": {type: "class", string: "docs-title-input"},
}

function ifStrArrAppearInString(sourceStr, toFindArr){
    if (toFindArr.some(v => sourceStr.includes(v))) {
        // There's at least one
        return true
    }
    return false
}

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.type == "updateIdentifierStrs") {
        window.identifierStrs = message.identifierStrs
    }else if(message.type == "stopTracking"){
        stopTracking()
    }else if(message.type == "startTracking"){
        initialize()
    }
});
  

function parseCourseId(elem){
    let elemText = elem.innerText;
    let elemValue = elem.value;
    for(course_id in window.identifierStrs){
        stringArr = window.identifierStrs[course_id]
        if(ifStrArrAppearInString(elemText, stringArr)) return course_id
        if(elemValue != null && ifStrArrAppearInString(elemValue, stringArr)) return course_id
    }
    return -1 // -1 means other for session type
}

window.addEventListener("load", () => {
    window.settedIntervals = []
    window.lastCourseId = -1
    initialize()
})

function initialize(){
    chrome.storage.sync.get(["loggedIn", "trackSites", "updateInterval", "courses", "courseDeterminantDiv", "identifierStrs"], function(items){
        if(items.hasOwnProperty("loggedIn") && items.hasOwnProperty("trackSites")){
            if(!items.loggedIn) return
            
            let currentSite = window.location.hostname;
            if(!items["trackSites"].includes(currentSite)) return;

            if(items.hasOwnProperty("identifierStrs")) window.identifierStrs = items.identifierStrs

            if(items.hasOwnProperty("courses")) window.courses = items.courses
            else return

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
            if(determinantDiv == null || !determinantDiv) window.courseDeterminantDiv = document.getElementsByTagName("body")[0]
            else window.courseDeterminantDiv = determinantDiv

            let indicatorElem = createTrackingIndicator()
            document.getElementsByTagName("body")[0].appendChild(indicatorElem)
            window.settedIntervals.push(setInterval(() => {
                updateIndicatorText()
            }, 3000))

            // extension tracking enabled
            if(items.updateInterval) window.studyTracker_updateInterval = items.updateInterval;
            else window.studyTracker_updateInterval = STUDY_TRACKER_UPDATE_INTERVAL

            window.anyAction = true;
            studyTracker_initializeListeners();
        }
    })
}

function stopTracking(){
    let updateIndicatorElem = document.getElementById("indicator-elem")
    updateIndicatorElem.parentElement.removeChild(updateIndicatorElem)
    for(var i = 0; i < window.settedIntervals.length; i++){
        clearInterval(window.settedIntervals[i])
        window.settedIntervals.pop(i)
    }
}

function updateIndicatorText(){
    let indicatorText = document.getElementById("indicator-text")
    if(indicatorText.getAttribute("tracking") == "true"){
        let courseId = parseCourseId(window.courseDeterminantDiv)
        let course_name = courseId != -1 ? window.courses[courseId].course_name : "other"
        indicatorText.innerText = "Tracking: "+course_name
    }
}

function updateIndicator(ifTracking){
    console.log("update tracker")
    let indicatorDiv = document.getElementById("indicator-div")
    let indicatorCircle = document.getElementById("indicator-circle")
    let indicatorText = document.getElementById("indicator-text")
    if(ifTracking == true){
        indicatorDiv.style.background = INDICATOR_DIV_BACKGROUND_GREEN
        indicatorCircle.style.background = INDICATOR_CIRCLE_COLOR_GREEN
        let courseId = parseCourseId(window.courseDeterminantDiv)
        let course_name = courseId != -1 ? window.courses[courseId].course_name : "other"
        indicatorText.innerText = "Tracking: "+course_name
        indicatorText.setAttribute("tracking", "true")
    }else if(ifTracking == false){
        indicatorDiv.style.background = INDICATOR_DIV_BACKGROUND_GREY
        indicatorCircle.style.background = INDICATOR_CIRCLE_COLOR_GREY
        indicatorText.innerText = "Not tracking"
        indicatorText.setAttribute("tracking", "false")
    }else if(ifTracking == null){
        if(window.anyAction != null) updateIndicator(window.anyAction)
    }else{
        updateIndicator(false)
    }
}

function createTrackingIndicator(){
    let indicatorElem = document.createElement("div")
    indicatorElem.id = "indicator-elem"
    if(window.location.hostname == "docs.google.com"){
        indicatorElem.style.cssText = "position: fixed;bottom: 13px; right: 126px; z-index: 99999;"
    }else{
        indicatorElem.style.cssText = "position: fixed;bottom: 8px; right: 8px; z-index: 99999;"
    }



    let indicatorDiv = document.createElement("div")
    indicatorDiv.id = "indicator-div"
    indicatorDiv.style.cssText = "background: "+INDICATOR_DIV_BACKGROUND_GREEN+"; font-size: 14px;padding: 3px 10px;border-radius: 20px;border: 1px solid green; cursor: pointer;"

    let indicatorCircle = document.createElement("div")
    indicatorCircle.id = "indicator-circle"
    indicatorCircle.style.cssText = "background: "+INDICATOR_CIRCLE_COLOR_GREEN+"; border-radius: 50%; padding: 3px;border: 1px solid black; display: inline-block; margin-right: 7px;"
    indicatorDiv.appendChild(indicatorCircle)
    
    //text
    let courseId = parseCourseId(window.courseDeterminantDiv)
    let course_name = courseId != -1 ? window.courses[courseId].course_name : "other"
    
    let indicatorText = document.createElement("span")
    indicatorText.id = "indicator-text"
    indicatorText.innerText = "Tracking: "+course_name
    indicatorText.setAttribute("tracking", "true")
    indicatorDiv.appendChild(indicatorText)


    indicatorElem.appendChild(indicatorDiv)
    
    return indicatorElem
}

function studyTracker_initializeListeners() {
    window.anyAction = false;
    window.lastCourseId = -1;
    window.settedIntervals.push(setInterval(() => {window.anyAction = false; updateIndicator();}, window.studyTracker_updateInterval))

    let onAction = (e) => {
        // if(e.type == "scroll");
        // else if(e.type == "keydown");
        updateIndicator()
        let currentCourseId = parseCourseId(window.courseDeterminantDiv);
        if(window.anyAction == false || window.lastCourseId != currentCourseId){
            if(currentCourseId != -1){
                chrome.runtime.sendMessage({
                    type: "ping",
                    courseId: currentCourseId,
                })
                console.log("study_tracker: sent ping :: course="+currentCourseId)
            }
        }
        window.lastCourseId = currentCourseId;
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