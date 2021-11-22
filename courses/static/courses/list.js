function displayNone(elemId){
    document.getElementById(elemId).style.display = "none";
}
function displayBlock(elemId){
    document.getElementById(elemId).style.display = "block";
}

function prepareForDelete(course_id){
    document.getElementById("delete-course-id").value = course_id
    document.getElementById("type-to-confirm").innerHTML = jsData.username+"/"+jsData.courses[course_id].course_name
    displayBlock('urlModel');
}
function cancelDelete(){
    window.prepareForDelete_id = null;
    document.getElementById("type-to-confirm").innerHTML = "username/course_name";
    displayNone("urlModel");
}

function deleteCourse(){
    if(document.getElementById("type-to-confirm").value == jsData.username+"/"+jsData.courses[window.prepareForDelete_id].course_name){

    }
}