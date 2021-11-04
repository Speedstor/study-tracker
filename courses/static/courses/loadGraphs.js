const timeBar_chartData = {
    data: {
        columns: [], // to be filled out
        type: "bar",
        types: {"total": "spline"},
        groups: [[]], // to be filled out
        colors:{}, // to be filled out
    },
    grid:{
        y: { 
        lines: [
            {
            value: 0
            }
        ]
        },
    },
    axis:{
        y: {
            tick: {
                format: function(x) { return Math.round(x*10)/10+"h"/* +" "+Math.round(x%1/60)+"m" */; },
                culling:{
                    min: 1
                },
            },
            min: 0,
            padding: {
              bottom: 0
            }
        },
        x:{
            type: "category",
            categories: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
        },
    },
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
              format: function(x) { return str_fill(Math.floor(x)+"", "0", 2)+":"+str_fill(Math.round(x%1/60)+"", "0", 2, false); }
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
const coursePi_chartData = {
    data: {
      columns: [],
      type: "donut", // for ESM specify as: donut()
    },
    donut: {
      title: "",
      label: {}
    },
    tooltip: {
      format: {},
    }
  }

const skills_chartData = {
    data: {
        x: "x",
        columns: [
            ["x", "Avg Study Duration", "Studied how many times", "Avg Time of Study\n(out->early, in->late)"],
        ],
        type: "radar", // for ESM specify as: radar()
        labels: false
    },
    radar: {
        axis: {
            // max: 400
        },
        level: {
            depth: 4
        },
        direction: {
            clockwise: true
        }
    },
}

const durationTime_chartData = {
    data: {
        xs: {},
        columns: [],
        type: "scatter", // for ESM specify as: scatter()
    },
    axis: {
        x: {
            label: "Time of day",
            tick: {
                fit: false
            },
            max: 24.0,
            padding: {
                top: 10
            },
        },
        y: {
            label: "Sessions' Duration"
        }
    },
    bindto: "#scatterPlot"
}


window.addEventListener("load", () => {
    let allow_course_select = true; // allow buttons to be pressed, so that the graphs would disclude courses
    
    if(jsData.hasOwnProperty('study_sessions')){
        if(document.getElementById("dayChart"))                     loadChart("day", "dayChart")
        if(document.getElementById("weekChart"))                    loadChart("week", "weekChart")
        if(document.getElementById("monthChart"))                   loadChart("month", "monthChart")
        if(document.getElementById("yearChart"))                    loadChart("year", "yearChart")
        if(document.getElementById("coursePiChart-week"))           loadChart("coursePi-week", "coursePiChart-week")
        if(document.getElementById("coursePiChart-month"))          loadChart("coursePi-month", "coursePiChart-month")
        if(document.getElementById("coursePiChart-year"))           loadChart("coursePi-year", "coursePiChart-year")
        if(document.getElementById("skillsRadarChart"))             loadChart("skillsRadar", "skillsRadarChart")
        if(document.getElementById("durationTimeScatterChart"))     loadChart("durationTimeScatter", "durationTimeScatterChart")
    }
})

function autoUnoadAll(course_id){
    let course_name = jsData.courses[course_id].course_name
    if(jsData.hasOwnProperty('study_sessions')){
        // if(document.getElementById("dayChart"))                     window.dayChart.unload({ids: course_name})
        if(document.getElementById("weekChart")){
            window.weekChart.unload({ids: [course_name, "total"]})
            // window.weekChart.load({
            //     columns: getChartData_timeBar(jsData.study_sessions, 1, 7,  "week", "weekChart").data.columns
            // });

        }
        if(document.getElementById("monthChart")){
            window.monthChart.unload({ids: [course_name, "total"]})
            // window.monthChart.load({
            //     columns: getChartData_timeBar(jsData.study_sessions, 1, 31,  "month", "monthChart").data.columns
            // });

        }
        if(document.getElementById("yearChart")){
            window.yearChart.unload({ids: [course_name, "total"]})
            // window.yearChart.load({columns: getChartData_timeBar(jsData.study_sessions, 31, 357, "year", "yearChart").data.columns});

        }
        if(document.getElementById("coursePiChart-week"))           window.coursePiWeekChart.unload({ids: course_name})
        if(document.getElementById("coursePiChart-month"))          window.coursePiMonthChart.unload({ids: course_name})
        if(document.getElementById("coursePiChart-year"))           window.coursePiYearChart.unload({ids: course_name})
        if(document.getElementById("skillsRadarChart"))             window.skillsRadarChart.unload({ids: course_name})
        if(document.getElementById("durationTimeScatterChart"))     window.durationTimeScatterChart.unload({ids: course_name})
    }
}

// window.yearChart.load({columns: getChartData_timeBar(jsData.study_sessions, 31, 357, "year", "yearChart").data.columns});
function autoLoadAll(){
    if(jsData.hasOwnProperty('study_sessions')){
        if(document.getElementById("dayChart"))                           window.dayChart.load({columns: []})
        if(document.getElementById("weekChart"))                          window.weekChart.load({columns: getChartData_timeBar(jsData.study_sessions, 1, 7,  "week", "weekChart").data.columns})
        if(document.getElementById("monthChart"))                         window.monthChart.load({columns: getChartData_timeBar(jsData.study_sessions, 1, 31,  "month", "monthChart").data.columns})
        if(document.getElementById("yearChart"))                          window.yearChart.load({columns: getChartData_timeBar(jsData.study_sessions, 31, 357, "year", "yearChart").data.columns})
        if(document.getElementById("coursePiChart-week"))                 window.coursePiWeekChart.load({columns: getChartData_coursePi(jsData.study_sessions, "week", "week").data.columns})
        if(document.getElementById("coursePiChart-month"))                window.coursePiMonthChart.load({columns: getChartData_coursePi(jsData.study_sessions, "month", "month").data.columns})
        if(document.getElementById("coursePiChart-year"))                 window.coursePiYearChart.load({columns: getChartData_coursePi(jsData.study_sessions, "year", "year").data.columns})
        if(document.getElementById("skillsRadarChart"))                   window.skillsRadarChart.load({columns: getChartData_skills(jsData.study_sessions, "skillsRadarChart").data.columns})
        if(document.getElementById("durationTimeScatterChart"))           window.durationTimeScatterChart.load({columns: getChartData_durationTime(jsData.study_sessions, "durationTimeScatterChart").data.columns})
    }
}

function loadChart(type, elemId){
    switch(type){
    case "day":
        window.dayChart = bb.generate(getChartData_dayChart(jsData.study_sessions, elemId));
        break;
    case "week":
        window.weekChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 7,  "week", elemId));
        break;
    case "month":
        window.monthChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 31,  "month", elemId));
        break;
    case "year":
        window.yearChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 31, 357, "year", elemId));
        break;
    case "coursePi-week":
        window.coursePiWeekChart = bb.generate(getChartData_coursePi(jsData.study_sessions, "week", elemId));
        break;
    case "coursePi-month":
        window.coursePiMonthChart = bb.generate(getChartData_coursePi(jsData.study_sessions, "month", elemId));
        break;
    case "coursePi-year":
        window.coursePiYearChart = bb.generate(getChartData_coursePi(jsData.study_sessions, "year", elemId));
        break;
    case "skillsRadar":
        window.skillsRadarChart = bb.generate(getChartData_skills(jsData.study_sessions, elemId));
        break;
    case "durationTimeScatter":
        window.durationTimeScatterChart = bb.generate(getChartData_durationTime(jsData.study_sessions, elemId));
        break;
    }
}

function getChartData_durationTime(study_sessions, elemId, allow_course_select=true, only_courses=[]){
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(durationTime_chartData))
    chartData["bindto"] = "#"+elemId
    chartData["axis"]["x"]["tick"]["format"] = function(x) { return str_fill(Math.floor(x)+"", "0", 2)+":"+str_fill(Math.round(x%1/60)+"", "0", 2, false); }
    

    let classData = {}
    for(const [c_id, c] of Object.entries(jsData.courses)){
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) continue;
        classData[c_id] = {}
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name
        classData[c_id]["x"] = []
        classData[c_id]["y"] = []

        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }

    for (const study_session of study_sessions) {
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(study_session.course_id))) continue;
        let session = study_session.session
        let start = new Date(Date.parse(session.start_date))
        let startDup = new Date(start);
        startDup.setHours(0, 0, 0, 0);
        let end = new Date(Date.parse(session.end_date))
        classData[study_session.course_id]["y"].push(inHours(start, end))
        classData[study_session.course_id]["x"].push(inHours(startDup, start))
    }

    for(const [c_id, c] of Object.entries(classData)){
        chartData.data.xs[c.course_name] = c.course_name+"_x"
        if(only_courses.length > 0 && !only_courses.includes(c_id)) continue;
        

        chartData.data.columns.push([c.course_name+"_x", ...c.x])
        chartData.data.columns.push([c.course_name, ...c.y])
    }

    return chartData
}

function getChartData_skills(study_sessions, elemId, allow_course_select=true, only_courses=[]){
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(skills_chartData))
    chartData["bindto"] = "#"+elemId

    let classData = {}
    for(const [c_id, c] of Object.entries(jsData.courses)){
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) continue;

        classData[c_id] = {}
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name
        classData[c_id]["avgDuration"] = 0
        classData[c_id]["numOfSessions"] = 0
        classData[c_id]["avgTimeOfStudy"] = 0
        
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }

    for (const study_session of study_sessions) {
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(study_session.course_id))) continue;
        let session = study_session.session
        let start = new Date(Date.parse(session.start_date))
        let end = new Date(Date.parse(session.end_date))
        classData[study_session.course_id]["avgDuration"] += inHours(start, end)
        classData[study_session.course_id]["numOfSessions"]++
        classData[study_session.course_id]["avgTimeOfStudy"] += Math.round(start.getTime()/36000)/100
    }
    
    let maxnumOfSessions = 0;
    let maxavgDuration = 0;
    let maxavgTimeOfStudy = 0;
    for(const key of Object.keys(classData)){
        let numOfSessions = classData[key]["numOfSessions"]
        let avgDuration = classData[key]["avgDuration"] / numOfSessions
        let avgTimeOfStudy = classData[key]["avgTimeOfStudy"] / numOfSessions
        if(numOfSessions > maxnumOfSessions) maxnumOfSessions = numOfSessions
        if(avgDuration > maxavgDuration) maxavgDuration = avgDuration
        if(avgTimeOfStudy > maxavgTimeOfStudy) maxavgTimeOfStudy = avgTimeOfStudy
    }

    for(const key of Object.keys(classData)){
        if(only_courses.length > 0 && !only_courses.includes(c_id)) continue;

        let numOfSessions = classData[key]["numOfSessions"]
        let avgDuration = classData[key]["avgDuration"] / numOfSessions
        let avgTimeOfStudy = classData[key]["avgTimeOfStudy"] / numOfSessions
        numOfSessions = Math.round(numOfSessions/maxnumOfSessions*100)/100
        avgDuration = Math.round(avgDuration/maxavgDuration*100)/100
        avgTimeOfStudy = Math.round(avgTimeOfStudy/maxavgTimeOfStudy*100)/100

        // if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(key))) {
        //     chartData.data.columns.push([classData[key]["course_name"], 0, 0]);
        //     continue;
        // }
        chartData.data.columns.push([classData[key]["course_name"], avgDuration, numOfSessions, avgTimeOfStudy])
    }

    return chartData
}

function getChartData_coursePi(study_sessions, type, elemId, allow_course_select=true, only_courses=[]){
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(coursePi_chartData))
    if(type == "month" || type == "year") chartData['donut']['label']['show'] = false
    chartData['tooltip']['format']['value'] = function(value, ratio, id) { return value+"h";}
    chartData["bindto"] = "#"+elemId
    chartData["donut"]["title"] = type

    let classData = {}
    for(const [c_id, c] of Object.entries(jsData.courses)){
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) continue;

        classData[c_id] = {}
        classData[c_id]["total"] = 0
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name
        
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }

    for (const study_session of study_sessions) {
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(study_session.course_id))) continue;

        let session = study_session.session
        let start = new Date(Date.parse(session.start_date))
        switch(type){
        case "week":
            if(todayDate.getWeek() != start.getWeek()) continue;
            break;
        case "month":
            if(todayDate.getMonth() != start.getMonth()) continue;
            break;
        case "year":
            if(todayDate.getYear() != start.getYear()) continue;
            break;
        }
        let end = new Date(Date.parse(session.end_date))
        classData[study_session.course_id]["total"] += inHours(start, end)
    }

    let if_all_zero = true;
    for(const [c_id, c] of Object.entries(classData)){
        if(only_courses.length > 0 && !only_courses.includes(c_id)) continue;
        // if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) {
        //     chartData["data"]["columns"].push([c.course_name, 0])
        //     continue
        // }

        if(c["total"] > 0) if_all_zero = false;
        else continue;
        chartData["data"]["columns"].push([c.course_name, c["total"]])
    }
    if(if_all_zero) {
        chartData["data"]["columns"].push(["none..", 1])
        chartData["data"]["colors"] = {
            "none..": "#bdbdbd"
        }
    }
    console.log(chartData)
    return chartData
}

function getChartData_timeBar(study_sessions, daysInBar, totalBars, chartType, elemId, allow_course_select=true, only_courses=[]){ //chartType 
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(timeBar_chartData))
    chartData["bindto"] = "#"+elemId
    chartData["axis"]["y"]["tick"]["format"] = function(x) { return Math.round(x*10)/10+"h"/* +" "+Math.round(x%1/60)+"m" */; };
    if (chartType == "week"){
        chartData.axis.x = {
            type: "category",
            categories: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
        }
    }else if(chartType == "month"){
        chartData.axis.x = {
            label: {
              text: todayDate.toLocaleString('default', { month: 'long' }),
              position: "outer-center"
            }
        }
    }else if(chartType == "year"){
        chartData.axis.x = {
            type: "category",
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        }
    }
    
    let total_days = new Array(Math.round(totalBars/daysInBar)).fill(0)
    let classData = {}
    for(const [c_id, c] of Object.entries(jsData.courses)){
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) continue;

        classData[c_id] = {}
        classData[c_id]["total_each_day"] = new Array(Math.round(totalBars/daysInBar)).fill(0)
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name

        chartData["data"]["groups"][0].push(classData[c_id]["course_name"])
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }
    for (const session of study_sessions) {
        if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(session.course_id))) continue;

        let start = new Date(Date.parse(session["session"].start_date))
        let dayIndex = -1
        switch(chartType){
        case "week":
            if(todayDate.getWeek() != start.getWeek()) continue;
            dayIndex = start.getDay()
            break;
        case "month":
            if(todayDate.getMonth() != start.getMonth()) continue;
            dayIndex = start.getDate()-1 //getDate() starts from 1, array starts from 0
            break;
        case "year":
            if(todayDate.getYear() != start.getYear()) continue;
            dayIndex = start.getMonth()
            break;
        }
        let end = new Date(Date.parse(session["session"].end_date))

        let duration = session["session"].duration
        if(duration != (end.getTime() - start.getTime())/60000) duration =  (end.getTime() - start.getTime())/60000
        duration /= 60
        classData[session.course_id]["total_each_day"][dayIndex] += duration
        total_days[dayIndex] += duration
    }
    for (const [c_id, cData] of Object.entries(classData)){
        if(only_courses.length > 0 && !only_courses.includes(c_id)) continue;
        // if(allow_course_select && window.deselect_classes && (window.deselect_classes.includes(c_id))) {
        //     chartData["data"]["columns"].push([cData.course_name, ...(new Array(Math.round(totalBars/daysInBar)).fill(0))])
        //     continue;
        // }
        chartData["data"]["columns"].push([cData.course_name, ...cData["total_each_day"]])
    }

    chartData["data"]["columns"].push(["total", ...total_days])
    console.log(chartData)
    return chartData
}

function getChartData_dayChart(study_sessions, elemId, allow_course_select=true, only_courses=[]){
    let todayDate = new Date() // this could be changed into a parameter, so that we can show last week, last month

    let chartData = JSON.parse(JSON.stringify(dayChart_chartData))
    chartData["bindto"] = "#"+elemId
    chartData["axis"]["y"]["tick"]["format"] = function(x) { return str_fill(Math.floor(x)+"", "0", 2)+":"+str_fill(Math.round(x%1/60)+"", "0", 2, false); }
    
    let total_for_each_course;
    let classData = {}
    chartData["data"]["groups"] = [[]]
    for(const [c_id, c] of Object.entries(jsData.courses)){
        classData[c_id] = {}
        classData[c_id]["sessions"] = []
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name
        classData[c_id]["first_start"] = null
        classData[c_id]["last_end"] = null
        
        chartData["data"]["groups"][0].push(classData[c_id]["course_name"])
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }
    
    let classes_sessions = {}
    let courseList = []
    for (const study_session of study_sessions) {
        let session = study_session.session
        let start = new Date(Date.parse(session.start_date))
        if(todayDate.toLocaleDateString() != start.toLocaleDateString()) continue;
        
        if(classData[study_session.course_id]["first_start"] == null) classData[study_session.course_id]["first_start"] = start

        let last_end = classData[study_session.course_id]["last_end"]
        if(last_end == null){
            last_end = new Date(Date.parse(session.end_date))
            last_end.setHours(0,0,0,0)
            classData[study_session.course_id]["last_end"] = last_end
        }
        let sessions = classData[study_session.course_id]["sessions"]
        
        if(start.getTime() > last_end.getTime()){
            sessions.push(inHours(last_end, start))
        }else sessions.push(0)
        classData[study_session.course_id]["last_end"] = new Date(Date.parse(session.end_date)) //this is the current end, but for convinence named last_end because it has to go in there eventually
        
        sessions.push(inHours(start, classData[study_session.course_id]["last_end"]))
    }
    
    let mostSessions = 0
    for(const [c_id, c] of Object.entries(classData)){
        let sessions = c["sessions"]
        courseList.push(c.course_name)
        if(sessions.length <= 0) {
            sessions.push(24)
        }else{
            sessions.push(24-sessions.reduce((a, b) => a + b))
        }

        if(sessions.length <= 0) sessions.push(24)
        classes_sessions[c_id] = {
            "course_name": c.course_name,
            "sessions": sessions
        }
        if(sessions.length > mostSessions) mostSessions = sessions.length
    }

    let courseKeys = Object.keys(classes_sessions)
    let columns = []
    let groups = []
    let colors = {}
    for(var i = 0; i < mostSessions; i++){
        let current = []
        let dataName = "solid"+i
        if(i % 2 == 0){
            dataName = "transparent"+i
            colors[dataName] = "#00000000"
        }
        current.push(dataName)
        groups.push(dataName)
        for (const key of courseKeys) {
            if(i < classes_sessions[key]["sessions"].length){
                current.push(classes_sessions[key]["sessions"][i])
            }else{
                current.push(0)
            }
        }
        columns.push(current)
    }

    chartData.data.columns = columns
    chartData.data.groups.push(groups)
    chartData.data.colors = colors
    chartData.axis.x.categories = courseList
    console.log(chartData)
    return chartData
}

function inHours(start, end){
    return Math.round((end.getTime() - start.getTime())/36000)/100
}

function str_fill(str, filler, length, ifFront = true){
    while(str.length < length){
        if(ifFront) str = filler + str
        else str = str + filler
    }
    return str
}



// Source: https://weeknumber.com/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }
  
  // Returns the four-digit year corresponding to the ISO week of the date.
  Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }