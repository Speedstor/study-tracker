function demo() {
    console.log("You were able to call this JS function")
}

let timerIntervalId = 0; // id of the timer, used to stop the timer
const startTime = 25 * 60
let timeRemaining = startTime;
const updateFrequency = 1000;
let sessionId = -1;
const url = "http://localhost:8000/courses/session/";
const homeURL = "http://localhost:8000/courses/";

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
function startSession() {
    console.log("in function startSession")
    // Notify the server that a session has been started.
    notifySessionStarted()

    // Update the timer periodically
    timerIntervalId = setInterval(function() {
        // Decrement the timer
        timeRemaining -= 1;

        // Compute the amount of time left
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;

        // Get the element displaying the time
        let timerElement = document.getElementById("timerElement");
        // Update the time display
        timerElement.innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);

        // If the timer is finished, stop it and notify the server
        if (timeRemaining <= 0) {
            clearInterval(timerIntervalId);
            notifySessionEnded(startTime - timeRemaining)
        }
        console.log("Decrementing timer");

    }, updateFrequency);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function notifySessionStarted() {
    let courseId = document.getElementById("courseIdElem").textContent
    console.log("courseID from html = " + courseId)

    let params = "sessionStatus=started&courseId=" + courseId
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    const csrfCookie = getCookie("csrftoken")
    console.log("CSRF cookie = " + csrfCookie)
    // req.setRequestHeader('Access-Control-Allow-Headers', "*");
    // req.setRequestHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    req.setRequestHeader('HTTP_X_CSRFTOKEN', csrfCookie);
    req.setRequestHeader('Access-Control-Expose-Headers', "sessionId")

    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);
        console.log("sessionId = " + req.getResponseHeader("sessionId"));
        sessionId = parseInt(req.getResponseHeader("sessionId"))
    }

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
        notifySessionEnded(startTime - timeRemaining)

        // Return the user to the home page
        window.location.replace(homeURL);
    }
}

function notifySessionEnded(secElapsed) {
    let params = "sessionStatus=ended&sessionId=" + String(sessionId) + "&secElapsed=" + String(secElapsed)
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    const csrfCookie = getCookie("csrftoken")
    req.setRequestHeader('HTTP_X_CSRFTOKEN', csrfCookie);

    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);
    }

    req.send(params)
    console.log("Sent request");
    resetState()
}

/**
 * Sets the timer interval id to 0 so it can be used again
 */
function resetTimerIntervalId() {
    timerIntervalId = 0;
}

/**
 * Sets the timer interval id to 0 so it can be used again
 */
function resetSessionId() {
    sessionId = -1;
}

function resetState() {
    resetTimerIntervalId()
    resetSessionId()
}

window.startSession = startSession
window.endSession = endSession
window.demo = demo
window.onload = startSession
window.onclose = resetState
window.onreload = resetState