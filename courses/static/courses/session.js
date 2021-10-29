function demo() {
    console.log("You were able to call this JS function")
}

let timerIntervalId = 0; // id of the timer, used to stop the timer
const startTime = 25 * 60
let timeRemaining = startTime;
const updateFrequency = 1000;
let sessionId = -1;
const url = "http://localhost:8000/courses/session/";
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
function startSession() {
    console.log("in function startSession")
    // Notify the server that a session has been started.
    notifySessionStarted()

    let timerElement = document.getElementById("timerElement");
     // Compute the amount of time left
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    // Update the time display
    timerElement.innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);

    // Update the timer periodically
    timerIntervalId = setInterval(function() {
        // Decrement the timer
        console.log("Decrementing timer");
        timeRemaining -= 1;
        // Compute the amount of time left
        minutes = Math.floor(timeRemaining / 60);
        seconds = timeRemaining % 60;
        // Update the time display
        timerElement.innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);
        // If the timer is finished, stop it and notify the server
        if (timeRemaining <= 0) {
            clearInterval(timerIntervalId);
            notifySessionEnded(startTime - timeRemaining)
        }
    }, updateFrequency);
}

function notifySessionStarted() {
    let params = "sessionStatus=started"
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);
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
    }
}

function notifySessionEnded(secElapsed) {
    let params = "sessionStatus=ended" + "&secElapsed=" + String(secElapsed)
    const req = new XMLHttpRequest();
    req.open("POST", url);
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

window.startSession = startSession
window.endSession = endSession
window.demo = demo
window.onload = startSession
window.onunload = endSession
window.onreload = endSession
