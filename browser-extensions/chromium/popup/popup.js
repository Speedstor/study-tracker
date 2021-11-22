const STUDY_TRACKER_API_HREF = "http://127.0.0.1:8000/api";

// chrome.runtime.sendMessage({opened: true}, function(response) {
//   // console.log(response.example);
// });

window.addEventListener("load", () => {
  document.getElementById("btnToggleCurrentSite").addEventListener("click", () => {
    toggleCurrentSite()
  })
  document.getElementById("btnRefresh").addEventListener("click", () => {
    updateSettings()
  })
  document.getElementById("btnShowEdit").addEventListener("click", () => {
    showEdit()
  })
  document.getElementById("btnExitEdit").addEventListener("click", () => {
    showEdit()
  })
  
  fetch(STUDY_TRACKER_API_HREF+"/checkLogin").then((response)=>response.json()).then((responseJson)=>{
    chrome.storage.sync.set({loggedIn: responseJson["status"]})
    chrome.storage.sync.get(["trackSites", "identifierStrs", "courses"], (items) => {
      console.log(items)
      if(!responseJson["status"]){
        //TODO:: show to have user login
        return
      }

      chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        window.currentSite = parseHostname(tabs[0].url)

        if(!items.hasOwnProperty("trackSites") || !items.hasOwnProperty("identifierStrs") || !items.hasOwnProperty("courses")) {
          updateSettings()
          return
        }

        window.trackSites = items["trackSites"]
        window.identifierStrs = items["identifierStrs"]
        window.courses = items["courses"]
        updatePageWithContent(window.currentSite, window.trackSites, window.identifierStrs, window.courses)
        updateHomepage();
        
        chrome.storage.sync.get(["lastUpdate"], (lastUpdateItem) => {
          if(lastUpdateItem.hasOwnProperty("lastUpdate")){
            let lastUpdate = new Date(Date.parse(lastUpdateItem["lastUpdate"]))
            let now = new Date()
            if((now.getTime() - lastUpdate.getTime()) > 1800000){ //half an hour
              console.log("updating..")
              updateSettings();
            }
          }else{
            updateSettings();
          }
        });

        updateDayChart()
      });
    })
  });
})

// UI storage and settings && api server communication
{
  function toggleCurrentSite(){
    let currentSite = window.currentSite
    if(currentSite == null || currentSite == "null") return;
    if(window.trackSites.includes(currentSite)){
      removeTrackSite(currentSite)
    }else{
      addTrackSite(currentSite)
    }
  }

  function addTrackSite(siteUrl){
    if(siteUrl == null || siteUrl == "null") return;
    if(!window.trackSites.includes(siteUrl)){
      fetch(STUDY_TRACKER_API_HREF+"/addTrackSite", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "site="+siteUrl,
      }).then((response)=>response.json()).then((responseJson)=>{
        if(responseJson.status == true);
        else {
          console.log("adding track site to api server error");
          return;
        }

        window.trackSites.push(siteUrl)
        updateTrackSites(window.trackSites, siteUrl) 
        updateHomepage()
        chrome.storage.sync.set({
          trackSites: window.trackSites,
        })
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          console.log(tabs)
          chrome.tabs.sendMessage(tabs[0].id, { type: "startTracking"} );
        });
      })
    }
  }
  
  function removeTrackSite(siteUrl){
    if(siteUrl == null || siteUrl == "null") return;
    if(window.trackSites.includes(siteUrl)){
      fetch(STUDY_TRACKER_API_HREF+"/removeTrackSite", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "site="+siteUrl,
      }).then((response)=>response.json()).then((responseJson)=>{
        if(responseJson.status == true);
        else {
          console.log("adding track site to api server error");
          return;
        }


        for(let i = 0; i < window.trackSites.length; i++){
          if(window.trackSites[i] == siteUrl){
            window.trackSites.splice(i, 1);
          }
        }
        updateTrackSites(window.trackSites, window.currentSite) 
        updateHomepage()
        chrome.storage.sync.set({
          trackSites: window.trackSites,
        })
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          console.log(tabs)
          chrome.tabs.sendMessage(tabs[0].id, { type: "stopTracking"} );
        });
      })
    }
  }

  function syncStrIdentifierUpdate(){
    let identifierStrsElem = document.getElementsByClassName("identifiers-strs")
    let identifierStrs = {}
    for(var i = 0; i < identifierStrsElem.length; i++){
      let contentStr = identifierStrsElem[i].value;
      let course_id = identifierStrsElem[i].getAttribute("identifierStr-courseId");
      if(course_id != null){
        try{
          identifierStrs[course_id].push(contentStr)
        }catch(error){
          identifierStrs[course_id] = [contentStr]
        }
      }
    }
    window.identifierStrs = identifierStrs
    fetch(STUDY_TRACKER_API_HREF+"/updateIdentifierStrs", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(identifierStrs),
    }).then((response)=>response.json()).then((responseJson)=>{
      if(responseJson.status == true);
      else {
        console.log("syncing identifierStr w/ api server error");
        return;
      }

      chrome.storage.sync.set({
        identifierStrs: window.identifierStrs,
      })
    })
  }
}


// update ui functions
{
  function updateHomepage(){
    if(window.trackSites){
      document.getElementById("numOfTrackSites").innerHTML = window.trackSites.length

      if(window.trackSites.includes(window.currentSite)){
        document.getElementById("trackStatusCurrentSite-wrap").style.borderColor = "rgb(25, 155, 36)";
        document.getElementById("trackStatusCurrentSite").innerHTML = "Current page is tracked";
        document.getElementById("btnToggleCurrentSite").innerHTML = "- Remove Site";
      }else{
        document.getElementById("trackStatusCurrentSite-wrap").style.borderColor = "rgb(189, 189, 189)";
        document.getElementById("trackStatusCurrentSite").innerHTML = "Current page is not tracked";
        document.getElementById("btnToggleCurrentSite").innerHTML = "+ Track Site";
      }
    }
  }
  
  function updatePageWithContent(currentSite, trackSites, identifierStrs, courses){
    updateTrackSites(trackSites, currentSite)
    updateIdentifierStrs(identifierStrs, courses);
  }

  function updateSettings(){
    fetch(STUDY_TRACKER_API_HREF+"/extensionSettings").then((response)=>response.json()).then((responseJson)=>{
      chrome.storage.sync.set({
        trackSites: responseJson.trackSites,
        identifierStrs: responseJson.identifierStrs,
        courses: responseJson.courses,
        "lastUpdate": new Date().getTime(),
      })
      chrome.runtime.sendMessage({type: "updateSettings", responseJson: responseJson}, function(response) {
        // console.log(response.example);
      });

      window.trackSites = responseJson.trackSites
      window.identifierStrs = responseJson.identifierStrs
      window.courses = responseJson.courses

      updatePageWithContent(window.currentSite, window.trackSites, window.identifierStrs, window.courses)
      updateHomepage()
      
    })
    updateDayChart()
  }

  function updateDayChart(){
    fetch(STUDY_TRACKER_API_HREF+"/getDayChart").then((response)=>response.json()).then((responseJson)=>{
      window.courses = responseJson.courses
      window.dayChart = bb.generate(getChartData_dayChart(responseJson.study_sessions, "dayChart"));
    })
  }

  function goToUrl(url){
    chrome.tabs.create({url: "http://"+url});
    // window.location.href = "http://"+url
  }

  function updateTrackSites(trackSitesArr, currentSite = null){
    let trackSitesDiv = document.getElementById("trackSites-list");
    trackSitesDiv.innerHTML = "";
    let scrollTo = null
    for(const siteHostname of trackSitesArr){
      let trackSiteItem = document.createElement("DIV")
      trackSiteItem.classList.add("trackSites-item");
      if(siteHostname == currentSite) {
        trackSiteItem.innerHTML = siteHostname+"&nbsp;&nbsp; <small><small>(current)</small></small>";
        scrollTo = trackSiteItem
      }else trackSiteItem.innerHTML = siteHostname
      trackSiteItem.addEventListener("click", () => {
        goToUrl(siteHostname)
      })
      trackSitesDiv.appendChild(trackSiteItem)
    }
    if(trackSitesArr.length == 0){
      let trackSiteItem = document.createElement("DIV")
      trackSiteItem.classList.add("trackSites-item");
      trackSiteItem.innerHTML = "No sites are added yet..";
      trackSiteItem.style.background = "rgb(219, 219, 219)";
  
      trackSitesDiv.appendChild(trackSiteItem)
    }
    if(scrollTo != null){
      scrollTo.scrollIntoView();
    }
  }

  function updateIdentifierStrs(identifierStrs, courses){
    let updateIdentifersDiv = document.getElementById("identifiers-list")
    updateIdentifersDiv.innerHTML = "";
    for(const [course_id, course] of Object.entries(courses)){
      let identifierItem = document.createElement("DIV")
      identifierItem.classList.add("identifiers-item")

      let identifier_course_id_input = document.createElement("INPUT")
      identifier_course_id_input.classList.add("identifiers-courseId")
      identifier_course_id_input.type = "text"
      identifier_course_id_input.value = course.course_name
      identifier_course_id_input.disabled = true
      identifierItem.appendChild(identifier_course_id_input)

      let identifiers_seperator = document.createElement("SPAN")
      identifiers_seperator.innerHTML = "&nbsp; : &nbsp;";
      identifierItem.appendChild(identifiers_seperator)

      let identifiers_strs_div = document.createElement("DIV")
      identifiers_strs_div.style.flexGrow = 3;
      identifiers_strs_div.style.width = "60%";
      identifierItem.appendChild(identifiers_strs_div)

      let str_input_empty_add = document.createElement("input")
      str_input_empty_add.classList.add("identifiers-identifyStr")
      str_input_empty_add.type = "text"
      str_input_empty_add.style.marginBottom = "14px"
      str_input_empty_add.addEventListener("input", () => {
        let str_input = document.createElement("input")
        str_input.classList.add("identifiers-identifyStr", "identifiers-strs")
        str_input.type = "text"
        str_input.value = str_input_empty_add.value
        str_input.style.marginBottom = "5px";
        str_input.setAttribute("identifierStr-courseId", course_id)
        str_input.addEventListener("input", () => {
          if(str_input.value == ""){
            str_input.parentElement.removeChild(str_input)
            str_input_empty_add.focus();
            syncStrIdentifierUpdate()
          }
        })
        str_input.addEventListener("change", () => {
          if(str_input.value != ""){
            syncStrIdentifierUpdate()
          }
        })
        
        identifiers_strs_div.insertBefore(str_input, str_input_empty_add)
        str_input.focus()
        str_input_empty_add.value = ""
      })
      
      if(identifierStrs[course_id]){
        for(const identifierStr of identifierStrs[course_id]){
          let str_input = document.createElement("input")
          str_input.classList.add("identifiers-identifyStr", "identifiers-strs")
          str_input.type = "text"
          str_input.value = identifierStr
          str_input.style.marginBottom = "5px";
          str_input.setAttribute("identifierStr-courseId", course_id)

          str_input.addEventListener("input", () => {
            if(str_input.value == ""){
              str_input.parentElement.removeChild(str_input)
              str_input_empty_add.focus()
              syncStrIdentifierUpdate()
            }
          })
          str_input.addEventListener("change", () => {
            if(str_input.value != ""){
              syncStrIdentifierUpdate()
            }
          })
          
          identifiers_strs_div.appendChild(str_input)
        }
      }
      identifiers_strs_div.appendChild(str_input_empty_add)
      
      
      
      // let identifiers_add_btn = document.createElement("BUTTON")
      // identifiers_add_btn.classList.add("btn-icon", "identifiers-add-btn")
      // identifiers_add_btn.innerHTML = "add"
      // identifiers_add_btn.addEventListener("click", () => {
      //   identifiers_strs_div.appendChild()
      // })
      // identifierItem.appendChild(identifiers_add_btn)

      updateIdentifersDiv.appendChild(identifierItem)
    }
  }
}

// button actions
{
  function showEdit(ifShow){
    if(ifShow == true){
      document.getElementById("homeDiv").style.display = "none";
      document.getElementById("editDiv").style.display = "flex";
    }else if(ifShow == false){
      document.getElementById("homeDiv").style.display = "flex";
      document.getElementById("editDiv").style.display = "none";
    }else if(ifShow == null){
      if(document.getElementById("homeDiv").style.display == "none"){
        showEdit(false);
      }else{
        showEdit(true);
      }
    }
    window.dayChart.resize()
  }
}

// helper functions
{
  function parseHostname(fullUrl){
    let matches = fullUrl.match(/^(https|http)?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    let currentSite = matches && matches[2]; 
    return currentSite
  }
}

// functions for parsing / generating dayChart data
{
  const dayChart_chartData = {
    data: {
        order: null,
        columns: [],
        type: "bar",
        groups: [],
        colors:{}, /* "transparent1": "#00000000" */
    },
    axis:{
        rotated: true,
        y: {
            max: 24.0,
            padding: {
                top: 10
            },
            tick: {
              format: function(x) { return str_fill(Math.floor(x)+"", "0", 2)+":"+str_fill(Math.round(x%1/60)+"", "0", 2, false); },
              culling:{
                min: 90
              },
            }
        },
        x:{
            type: "category",
            categories: [],
        },
    },
    legend: {
        show: false
    },
    interaction: {
      enabled: false,
    },
  }

  function inHours(start, end){
    return Math.round((end.getTime() - start.getTime())/36000)/100
  }

  function getChartData_dayChart(study_sessions, elemId, allow_course_select=true, only_courses=[]){
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(dayChart_chartData))
    chartData["bindto"] = "#"+elemId
    chartData["axis"]["y"]["tick"]["format"] = function(x) { return str_fill(Math.floor(x)+"", "0", 2)+":"+str_fill(Math.round(x%1/60)+"", "0", 2, false); }
    
    let total_for_each_course;
    let classData = {}
    chartData["data"]["groups"] = [[]]
    for(const [c_id, c] of Object.entries(window.courses)){
        classData[c_id] = {}
        classData[c_id]["sessions"] = []
        classData[c_id]["course_name"] = c.course_name
        classData[c_id]["first_start"] = null
        classData[c_id]["last_end"] = null
        
        chartData["data"]["groups"][0].push(classData[c_id]["course_name"])
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }

    let totalSessions = 0;
    let totalHours = 0;
    
    let classes_sessions = {}
    let courseList = []
    let last_end = null
    let sessions = []
    for (const study_session of study_sessions) {
        let session = study_session.session
        let start = new Date(Date.parse(session.start_date))
        if(todayDate.toLocaleDateString() != start.toLocaleDateString()) continue;
        
        if(classData[study_session.course_id]["first_start"] == null) classData[study_session.course_id]["first_start"] = start

        if(last_end == null){
            last_end = new Date(Date.parse(session.end_date))
            last_end.setHours(0,0,0,0)
        }
        
        if(start.getTime() > last_end.getTime()){
            sessions.push(inHours(last_end, start))
        }else sessions.push(0)
        last_end = new Date(Date.parse(session.end_date)) //this is the current end, but for convinence named last_end because it has to go in there eventually
        
        sessionHours = inHours(start, last_end)
        totalHours += sessionHours
        totalSessions++;
        sessions.push(sessionHours)
    }
    
    if(sessions.length <= 0) {
        sessions.push(24)
    }else{
        sessions.push(24-sessions.reduce((a, b) => a + b))
    }

    let columns = []
    let groups = []
    let colors = {}
    for(var i = 0; i < sessions.length; i++){
      let dataName = "solid"+i
      if(i % 2 == 0){
        dataName = "transparent"+i
        colors[dataName] = "#00000000"
      }
      let current = [dataName, sessions[i]]
      groups.push(dataName)
      columns.push(current)
    }

    chartData.data.columns = columns
    chartData.data.groups.push(groups)
    chartData.data.colors = colors
    chartData.axis.x.categories = ["all"]

    try {
      document.getElementById("todayTotalHours").innerHTML = `${truncateTimeDuration(totalHours)} <br/><small><small>${timeTypeText(totalHours)}</small></small>`;
      document.getElementById("todayTotalSessions").innerHTML = `${totalSessions} <br/><small><small>session${pluralize(totalSessions)}</small></small>`;
      document.getElementById("todayAvgSpan").innerHTML = `${truncateTimeDuration(totalHours/totalSessions, true)} <br/><small><small>avg span</small></small>`;
    } catch (error) {
      console.log(error)
    }

    console.log(chartData)
    return chartData
  }

  function pluralize(num){
    if(num > 1 || num < -1){
      return "s"
    }else{
      return ""
    }
  }
  
  function timeTypeText(hours, ifText=false){
    let hour = Math.round(hours)
    let minute = Math.round(hours%1*60)
    if(hour == 0){
      return "minute"+pluralize(minute);
    }else{
      return "hour"+pluralize(hour);
    }
  }

  function truncateTimeDuration(hours, ifText=false){
    let hour = Math.round(hours*10)/10
    let minute = Math.round(hours%1*60)
    if(Math.round(hour) == 0){
      let minutesText = minute + `${ifText ? "m" : ""}`
      return minutesText
    }else{
      let hoursText = hour + `${ifText ? "h" : ""}`
      return hoursText
    }
  }

  function str_fill(str, filler, length, ifFront = true){
    while(str.length < length){
        if(ifFront) str = filler + str
        else str = str + filler
    }
    return str
  }
}
