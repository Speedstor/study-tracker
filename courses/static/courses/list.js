function displayNone(elemId){
    document.getElementById(elemId).style.display = "none";
}
function displayBlock(elemId){
    document.getElementById(elemId).style.display = "block";
}

function prepareForDelete(course_id){
    window.prepareForDelete_id = course_id;
    let username = "username";
    document.getElementById("type-to-confirm").innerHTML = username+"/"+jsData.courses[course_id].course_name
    displayBlock('urlModel');
}
function cancelDelete(){
    window.prepareForDelete_id = null;
    document.getElementById("type-to-confirm").innerHTML = "username/course_name";
    displayNone("urlModel");
}

function deleteCourse(){
    let username = "username";
    if(document.getElementById("type-to-confirm").value == username+"/"+jsData.courses[window.prepareForDelete_id].course_name){

    }
}