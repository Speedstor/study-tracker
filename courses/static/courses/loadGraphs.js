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

window.addEventListener("load", () => {
    if(jsData.hasOwnProperty('study_sessions')){
        if(document.getElementById("dayChart")) loadChart("day")
        if(document.getElementById("weekChart")) loadChart("week")
        if(document.getElementById("monthChart")) loadChart("month")
        if(document.getElementById("yearChart")) loadChart("year")
        if(document.getElementById("coursePiChart")) loadChart("coursePi")
        if(document.getElementById("skillsRadarChart")) loadChart("skillsRadar")
        if(document.getElementById("durationTimeScatterChart")) loadChart("durationTimeScatter")
    }
})

function loadChart(type){
    switch(type){
    case "week":
        window.weekChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 7,  "week", "weekChart"));
        break;
    case "day":
        window.dayChart = bb.generate(getChartData_dayChart(jsData.study_sessions, "dayChart"));
        break;
    case "month":
        window.monthChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 31,  "month", "monthChart"));
        break;
    case "year":
        window.monthChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 31, 357, "year", "yearChart"));
        break;
    case "coursePi":
        // window.coursePiChart = bb.generate(getChartData_dayChart(jsData.study_sessions));
        break;
    case "skillsRadar":
        // window.skillsRadarChart = bb.generate(getChartData_dayChart(jsData.study_sessions));
        break;
    case "durationTimeScatter":
        // window.durationTimeScatterChart = bb.generate(getChartData_dayChart(jsData.study_sessions));
        break;
    }
}

function getChartData_monthChart(study_sessions){


}

function getChartData_timeBar(study_sessions, daysInBar, totalBars, chartType, elemId){ //chartType 
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
        classData[c_id] = {}
        classData[c_id]["total_each_day"] = new Array(Math.round(totalBars/daysInBar)).fill(0)
        classData[c_id]["course_name"] = jsData.courses[c_id].course_name

        chartData["data"]["groups"][0].push(classData[c_id]["course_name"])
        //TODO:: let user choose the color for each course
        //chartData["columns"]["color"].append({classData[c_id]["course_name"]: "#fffff"})
    }
    for (const session of study_sessions) {
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
    for (const [_, cData] of Object.entries(classData)){
        chartData["data"]["columns"].push([cData.course_name, ...cData["total_each_day"]])
    }

    chartData["data"]["columns"].push(["total", ...total_days])
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

function getChartData_coursePi(){

}

function getChartData_dayChart(study_sessions, elemId){
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