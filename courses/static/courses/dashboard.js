


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



window.addEventListener("load", () => {
    let dragbtn = document.getElementById("moveWhiteboard");
    dragbtn.addEventListener("mousedown", () => {
        window.ifMoveWhiteboard = true;
    });
})
window.addEventListener("mousemove", (e) =>{
    
    if(window.ifMoveWhiteboard){
        // circle.style.left = e.pageX + 'px';
        // circle.style.top = e.pageY + 'px';
        let setMarginTop = e.pageY - document.getElementById("moveWhiteboard").offsetTop - 100;
        console.log(setMarginTop);
        if(setMarginTop > -481) document.getElementById("whiteboard").style.marginTop = setMarginTop + "px";
    }
  })

  window.addEventListener("mouseup", (e) => {
    window.ifMoveWhiteboard = false;
  })



function dragElementVertMargin(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      document.getElementById("whiteboard").style.marginTop = (elmnt.offsetTop - pos2) + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
}