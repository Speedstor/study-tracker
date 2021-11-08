
(function() {
  // receives message from popup script
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.opened == true) {
      // sends response back to popup script
      sendResponse({example: "goodbye"});

      // sends response to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { logUrl: true } );
      });
    }
  });
})();


document.onkeydown = function(e) {
  // what you want to on key press.
  console.log("pressed "+e.key)
};



var ime_api = chrome.input.ime;

var context_id = -1;

chrome.input.ime.onKeyEvent.addListener(
function(engineID, keyData) {
  console.log(engineID);
  console.log('onKeyEvent:' + keyData.key + " context: " + context_id);
  if (keyData.type == "keydown" && keyData.key.match(/^[a-z]$/)) {
    chrome.input.ime.commitText({"contextID": context_id,
                                 "text": keyData.key.toUpperCase()});
    return true;
  }

  return false
});