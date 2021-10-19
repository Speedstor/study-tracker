/**
 * Event handlers for the login page
 */

import { createAccountURL, loginURL, homepageURL, XMLReadyStateDone, userTokenKey } from "./constants.js";



function setUserToken(userToken) {  
    sessionStorage.setItem(userTokenKey, userToken);
    console.log("sessionStorage: setting " + userToken);
}

export function getUserToken() {
    let userToken = sessionStorage.getItem(userTokenKey);
    console.log("sessionStorage: getting " + userToken);
    return userToken;
}

/**
 * Parses the response text to obtain whether the account creation / login succeeded and the 
 * user token.
 * @param {string} responseText 
 */
function handleUserAuthResponse(responseText) {
    console.log("handleUserAuthResponse, Response: " + responseText);
    let obj = JSON.parse(responseText)
    let success = obj.success
    let userToken = obj.userToken;
    if (success) {
        setUserToken(userToken);
        navigateToHomepage();
    } else {
        alert("Account creation failed / username or password is incorrect");
    }
}


/**
 * Sends the account info to the server.
 */
 function createAccount() {
    // Get the username
    let usernameElement = document.getElementById("username");
    let username = usernameElement.value
    
    // Get the password
    let passwordElement = document.getElementById("password");
    let password = passwordElement.value

    // Check if both the username and password were provided
    if (!checkUsernamePassword(username, password)) {
        return;
    }

    // Send the username and password to the server for authentication
    const req = new XMLHttpRequest();
    const url = createAccountURL;

    req.open("POST", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);  
        if (req.readyState == XMLReadyStateDone) {
            handleUserAuthResponse(req.responseText);            
        }
    }

    let params = "username=" + username + "&password=" + password;
    req.send(params);
}

/**
 * Sends the login info to the server.
 */
function login() {
    // Get the username
    let usernameElement = document.getElementById("username");
    let username = usernameElement.value
    
    // Get the password
    let passwordElement = document.getElementById("password");
    let password = passwordElement.value

    // Check if both the username and password were provided
    if (!checkUsernamePassword(username, password)) {
        return;
    }

    // Send the username and password to the server for authentication
    const req = new XMLHttpRequest();
    const url = loginURL;

    req.open("GET", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);  
        if (req.readyState == XMLReadyStateDone) {
            handleUserAuthResponse(req.responseText);            
        }
    }

    let params = "username=" + username + "&password=" + password;
    req.send(params);
}

/**
 * Creates an alert dialog if either the username or password is empty.
 * @param {string} username 
 * @param {string} password 
 * @returns True if neither the username nor password is empty, False if at least one is empty.
 */
function checkUsernamePassword(username, password) {
    if (username == "" || password == "") {
        alert("username/password is incorrect");
        return false;
    } else {
        return true;
    }
}

function navigateToHomepage() {
    window.location.href = homepageURL;
}

// Give the functions global scope in the HTML file
window.createAccount = createAccount;
window.login = login;
