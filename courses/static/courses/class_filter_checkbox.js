function deselect_class_from_graph(course_id){
    if(!window.deselect_classes) window.deselect_classes = []
    window.deselect_classes.push(course_id)
    autoUnoadAll(course_id)
}
function redisplay_class_to_graph(course_id){
    if(!window.deselect_classes) return
    console.log("cleanning")
    for(var i = 0; i < window.deselect_classes.length; i++){
        if(window.deselect_classes[i] == course_id) window.deselect_classes.splice(i, 1)
    }
    autoLoadAll()
}
function checkbox_toggle_class(elem, course_id){
    console.log(elem.value)
    if(elem.checked) redisplay_class_to_graph(course_id)
    else deselect_class_from_graph(course_id)
}