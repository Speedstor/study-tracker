function demo() {
    console.log("You were able to call this JS function")
}

let timerIntervalId = 0; // id of the timer, used to stop the timer
const DEFULT_TIMER_DURATION = 25 * 60
var timeRemaining = DEFULT_TIMER_DURATION;
var timeAccumulate = 0;
const updateFrequency = 1000;
let sessionId = -1;
const apiSessionUrl = "http://"+window.location.host+"/api/session";
// const homeURL = "http://localhost:8000/courses/";

/**
 * Converts the numerical time in seconds or minutes to a string with 2 digits.
 * A 0 is prepended if time is only 1 digit.
 * @param {number} time
 * @returns String representation of the seconds or minutes with two digits.
 */
 function formatSecondsMinutes(time) {
    if (time <= 9) {
        return "0" + String(time);
    } else {
        return String(time);
    }
}


/**
 * Called when a session is started. Displays a countdown timer to the user. Stops the timer
 * when it reaches 0.
 */
function start_session() {
    console.log("in function startSession")
    // Notify the server that a session has been started.
    notifySessionStarted()

    document.getElementById("start-session-div").style.display = "none";
    document.getElementById("ongoing-session-div").style.display = "block";
    let countdownTimer = document.getElementById("countdownTimer");
     // Compute the amount of time left
    timeRemaining = DEFULT_TIMER_DURATION;
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    // Update the time display
    countdownTimer.innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);
    start_timer()
}

function start_timer(){
    // Update the timer periodically
    timerIntervalId = setInterval(function() {
        // Decrement the timer
        console.log("Decrementing timer");
        timeRemaining -= 1;
        timeAccumulate += 1;
        updateTimer()
        // If the timer is finished, stop it and notify the server
        if (timeRemaining <= 0) {
            // clearInterval(timerIntervalId);
            // notifySessionEnded()
        }
    }, updateFrequency);
}

function updateTimer(){
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = Math.floor(timeRemaining % 60);
    // Update the time display
    document.getElementById("countdownTimer").innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);
    minutes = Math.floor(timeAccumulate / 60);
    seconds = Math.floor(timeAccumulate % 60);
    document.getElementById("countupTimer").innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);
}

function continue_session() {
    if(jsData.hasOwnProperty("ongoing_session")){
        jsData["ongoing_session"] = JSON.parse(jsData["ongoing_session"])[0].fields
        let ongoing_session = jsData["ongoing_session"]
        console.log("continue_session")
        if(ongoing_session.start_date != ongoing_session.end_date) {
            console.log("session errore")
            document.getElementById("start-session-div").style.display = "block";
            document.getElementById("ongoing-session-div").style.display = "none";
            return
        }
        console.log(new Date())
        console.log(ongoing_session.start_date)
        console.log(new Date(Date.parse(ongoing_session.start_date)))
        var time_since_session_start = ((new Date())-(new Date(Date.parse(ongoing_session.start_date))))/1000;
        console.log(time_since_session_start)
        timeRemaining = DEFULT_TIMER_DURATION - time_since_session_start;
        timeAccumulate = time_since_session_start
        updateTimer()
        start_timer()

    }
}

function notifySessionStarted() {
    let params = "sessionStatus=started&course="+document.getElementById("id_course").value
    const req = new XMLHttpRequest();
    req.open("POST", apiSessionUrl);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);
    }
    returnHook = function () {
        console.log(req.response);
    }
    req.onload = returnHook
    req.onerror = returnHook

    req.send(params)
    console.log("Sent request");
}


/**
 * Called when the user ends a session. Notifies the server that the session has ended and stops
 * the timer.
 */
function endSession() {
    console.log("in function endSession")
    console.log("timerIntervalId = " + timerIntervalId)

    // If the timer has not yet been called or has been stopped (i.e. the id == 0), do nothing. Otherwise,
    // stop the timer and notify the server
    if (timerIntervalId !== 0) {
        console.log("Stopping timer")
        // Stop the timer
        clearInterval(timerIntervalId);
        // Reset the timer interval id
        resetTimerIntervalId();
        // Notify the server that the session has ended.
        notifySessionEnded()
    }
}

function notifySessionEnded() {
    let params = "sessionStatus=ended"
    const req = new XMLHttpRequest();
    req.open("POST", apiSessionUrl);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);
        if (req.readyState === 4 && req.status === 302) {
            let responseJSON = JSON.parse(req.responseText)
            let redirectURL = responseJSON.redirectURL;
            console.log("redirectURL = " + redirectURL)
            // Return the user to the home page
            window.location.replace(redirectURL);
        }
    }
    req.send(params)
    console.log("Sent request");
}

/**
 * Sets the timer interval id to 0 so it can be used again
 */
function resetTimerIntervalId() {
    timerIntervalId = 0;
}

window.endSession = endSession
window.demo = demo
// window.onunload = endSession
// window.onreload = endSession

window.addEventListener("load", () => {
    if(jsData.hasOwnProperty("ongoing_session")){
        continue_session()
    }
})