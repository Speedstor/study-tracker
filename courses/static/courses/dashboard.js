


function showToday(){
    document.getElementById("graphWeek").style.display = "none";
    document.getElementById("graphToday").style.display = "block";
}
function showWeek(){
    document.getElementById("graphWeek").style.display = "block";
    document.getElementById("graphToday").style.display = "none";
}
function toggleToday(){
    toggleElem("graphToday");
}
function toggleWeek(){
    toggleElem("graphWeek");
}
function toggleElem(elemId){
    var graph = document.getElementById(elemId);
    if(graph.style.display == "none"){
        graph.style.display = "block";
    }else{
        graph.style.display = "none";
    }
}