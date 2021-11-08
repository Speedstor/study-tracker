if(window.location.hostname == "docs.google.com"){
    let iframe = document.getElementsByClassName('docs-texteventtarget-iframe')[0];
    let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
    innerDoc.addEventListener("keydown", (e) => {
        studyTracker_onKeyDown(e);
    });
}else{
    document.addEventListener("keydown", (e) => {
        studyTracker_onKeyDown(e);
    });
}

function studyTracker_onKeyDown(e){

}

