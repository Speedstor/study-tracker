/**
 * Defines function handlers for the app
 */

import { courseSessionKey, createCourseURL, sessionPageURL } from "./constants.js";
// import { getUserToken } from "./login.js";

function displayCourses() {
    let courses = ["Course 1", "Course 2", "Course 3"];
    // TODO: display courses in HTML + register handler for each

}

export function setCourseSession(courseName) {
    sessionStorage.setItem(courseSessionKey, courseName);
}


/**
 * Called when a course is clicked. Navigates to the page with the timer.
 */
function onCourseClick() {
    console.log("Navigating to session page");
    // TODO: set the course session key here
    let getCourseName = "Find which course was clicked and get its name";
    setCourseSession(getCourseName)
    window.location.href = sessionPageURL;
}

/**
 * Called when the user clicks the add course button.
 */
function onAddCourseClick() {
    var modal = document.getElementById("addCourseModal");
    modal.style.display = "block";
}

/**
 * Closes the modal that contains the add course prompt.
 */
function closeCourseModal() {
    var modal = document.getElementById("addCourseModal");
    modal.style.display = "none";
}

/**
 * Called when the user confirms they want to create a course with a specific name.
 * Makes a POST request to the server with the course name.
 */
function createCourse() {
    console.log("createCourse called");
    const courseNameId = "courseName"
    // Get the course name element
    var courseName = document.getElementById(courseNameId);

    // Create the request body to send to the server
    var params = courseNameId + "=" + courseName.value;
    
    // Clear the course name text from the page
    courseName.value = "";

    // Send the course name to the server
    const req = new XMLHttpRequest();
    const url = createCourseURL;
    req.open("POST", url);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = function() {
        console.log("readyState = " + req.readyState);
        console.log("status = " + req.status);  
    }

    req.send(params)

    // Close the modal containing the add course prompt
    closeCourseModal()
}

// Give the functions global scope in HTML
window.onCourseClick = onCourseClick
window.onAddCourseClick = onAddCourseClick
window.createCourse = createCourse
window.closeCourseModal = closeCourseModal
// window.onload = getUserToken

