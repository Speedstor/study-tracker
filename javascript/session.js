/**
 * Event handlers for the study session (timer)
 */

import { endSessionURL, homepageURL, startSessionURL } from "./constants.js";

{
    var timerIntervalId = 0; // id of the timer, used to stop the timer
}

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
 * TODO: Receive the course name as an argument
 */
function startSession() {
    // Get the start button and disable it to prevent the user from starting any more timers
    var startBtn = document.getElementById("startSession");
    startBtn.disabled = true;

    // Notify the server that a session has been started.
    notifySessionStarted()

    // Set the target time
    // const timeInSeconds = 60 * 25; // 25 minutes
    const timeInSeconds = 60 * 25;
    var timeRemaining = timeInSeconds;

    // Set the update frequency (in ms)
    const updateFrequency = 1000;

    // Update the timer periodically
    timerIntervalId = setInterval(function() {
        // Decrement the timer
        timeRemaining -= 1;

        // Compute the amount of time left
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = timeRemaining % 60;

        // Get the element displaying the time
        var timerElement = document.getElementById("timerElement");
        // Update the time display
        timerElement.innerHTML = formatSecondsMinutes(minutes) + " : " + formatSecondsMinutes(seconds);

        // If the timer is finished, stop it and notify the server
        if (timeRemaining <= 0) {
            clearInterval(timerIntervalId);
            notifySessionEnded()
        }
        console.log("Decrementing timer");

    }, updateFrequency); 
}

function notifySessionStarted() {
    var params = "sessionStarted=1"
    const req = new XMLHttpRequest();
    const url = startSessionURL;
    req.open("POST", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);  
    }

    req.send(params)
    console.log("Returned from sending request");
}


/**
 * Called when the user ends a session. Notifies the server that the session has ended and stops
 * the timer.
 */
function endSession() {
    console.log("in endSession()")
    console.log("timerInervalId = " + timerIntervalId)

    // If the timer has not yet been called (i.e. the id == 0), do nothing. Otherwise,
    // stop the timer and notify the server
    if (timerIntervalId != 0) {
        // Stop the timer
        clearInterval(timerIntervalId);

        // Reset the timer interval id
        resetTimerIntervalId();

        // Notify the server that the session has ended.
        notifySessionEnded()

        // Return the user to the home page
        window.location.replace(homepageURL);    
    }
}

function notifySessionEnded() {
    var params = "sessionEnded=1"
    const req = new XMLHttpRequest();
    const url = endSessionURL;
    req.open("POST", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);  
    }

    req.send(params)
    console.log("Returned from sending request");
}

/**
 * Sets the timer interval id to 0 so it can be used again
 */
function resetTimerIntervalId() {
    timerIntervalId = 0;
}

window.startSession = startSession
window.endSession = endSession
