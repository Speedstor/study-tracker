const STUDY_TRACKER_API_HREF = "http://127.0.0.1:8000/api";

// chrome.runtime.sendMessage({opened: true}, function(response) {
//   // console.log(response.example);
// });

function updatePageWithContent(currentSite, trackSites, identifierStrs, courses){
  updateTrackSites(trackSites, currentSite)

  if(trackSites.includes(currentSite)){
    showIdentifier(true)
    if(identifierStrs.hasOwnProperty(currentSite)){
      updateIdentifierStrs(identifierStrs[currentSite], courses);
    }else{
      emptyIdentifierStrs(courses)
    }
  }else{
    showIdentifier(false)
  }
}

function updateDayChart(){
  fetch(STUDY_TRACKER_API_HREF+"/getDayChart").then((response)=>response.json()).then((responseJson)=>{
    window.courses = responseJson.courses
    window.dayChart = bb.generate(getChartData_dayChart(responseJson.study_sessions, "dayChart"));
  })
}

window.addEventListener("load", () => {
  document.getElementById("btnAddCurrentCourse").addEventListener("click", () => {
    addCurrentSite()
  })
  document.getElementById("btnRefresh").addEventListener("click", () => {
    updateSettings()
  })
  
  fetch(STUDY_TRACKER_API_HREF+"/checkLogin").then((response)=>response.json()).then((responseJson)=>{
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
        }else{
          window.trackSites = items["trackSites"]
          window.identifierStrs = items["identifierStrs"]
          window.courses = items["courses"]
        }
        updatePageWithContent(window.currentSite, window.trackSites, window.identifierStrs, window.courses)
        
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

function addCurrentSite(){
  let currentSite = window.currentSite
  if(currentSite == null || currentSite == "null") return;
  if(!window.trackSites.includes(currentSite)){
    addTrackSite(currentSite)
  }
  emptyIdentifierStrs(window.courses);
  showIdentifier(true)
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
      else;

      window.trackSites.push(siteUrl)
      updateTrackSites(window.trackSites, siteUrl)
      chrome.storage.sync.set({
        trackSites: window.trackSites,
      })
    })
  }
}

function updateSettings(){
  fetch(STUDY_TRACKER_API_HREF+"/extensionSettings").then((response)=>response.json()).then((responseJson)=>{
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      chrome.storage.sync.set({
        trackSites: responseJson.trackSites,
        identifierStrs: responseJson.identifierStrs,
        courses: responseJson.courses,
        "lastUpdate": new Date().getTime(),
      })

      let currentSite = parseHostname(tabs[0].url)
      window.trackSites = responseJson.trackSites
      window.identifierStrs = responseJson.identifierStrs
      window.courses = responseJson.courses

      updatePageWithContent(currentSite, window.trackSites, window.identifierStrs, window.courses)
    })
  })
  updateDayChart()
}

function parseHostname(fullUrl){
  let matches = fullUrl.match(/^(https|http)?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  let currentSite = matches && matches[2]; 
  return currentSite
}

function getCurrentHostName(){
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.executeScript(tab.id,{
      code: `return window.location.hostname`
    }, successResponse);
  }); 
}

async function getJSON(url) {
  return fetch(url)
      .then((response)=>response.json())
      .then((responseJson)=>{return responseJson});
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
    // trackSitesDiv.scrollTo(scrollTo)
  }
}

function showIdentifier(ifShow){
  if(ifShow){
    document.getElementById("identifiers-title").style.display = "block"
    document.getElementById("identifiers-list").style.display = "block"
  }else{
    document.getElementById("identifiers-title").style.display = "none"
    document.getElementById("identifiers-list").style.display = "none"
  }
}

function emptyIdentifierStrs(courses){
  let updateIdentifersDiv = document.getElementById("identifiers-list")
  updateIdentifersDiv.innerHTML = "";

  for(const [course_id, course] of Object.entries(courses)){
    let identifierItem = document.createElement("DIV")
    identifierItem.classList.add("identifiers-item")

    let identifier_course_id_input = document.createElement("INPUT")
    identifier_course_id_input.classList.add("identifiers-courseId")
    identifier_course_id_input.type = "text"
    console.log(course_id, courses, courses[course_id])
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

    let str_input = document.createElement("input")
    str_input.classList.add("identifiers-identifyStr")
    str_input.type = "text"
    str_input.value = "None yet.."
    str_input.disabled = true
    identifiers_strs_div.appendChild(str_input)

    updateIdentifersDiv.appendChild(identifierItem)
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

    if(!identifierStrs[course_id]){
      let str_input = document.createElement("input")
      str_input.classList.add("identifiers-identifyStr")
      str_input.type = "text"
      str_input.value = "None yet.."
      str_input.disabled = true
      identifiers_strs_div.appendChild(str_input)
    }else{
      for(const identifierStr of identifierStrs[course_id]){
        let str_input = document.createElement("input")
        str_input.classList.add("identifiers-identifyStr")
        str_input.type = "text"
        str_input.disabled = true
        str_input.value = identifierStr
        str_input.style.background = "white";
        
        identifiers_strs_div.appendChild(str_input)
      }
    }
    
    updateIdentifersDiv.appendChild(identifierItem)
  }
}


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
      
      sessions.push(inHours(start, last_end))
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
  console.log(chartData)
  return chartData
}

function str_fill(str, filler, length, ifFront = true){
  while(str.length < length){
      if(ifFront) str = filler + str
      else str = str + filler
  }
  return str
}
