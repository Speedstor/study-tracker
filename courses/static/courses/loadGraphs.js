
window.addEventListener("load", () => {
    if(jsData.hasOwnProperty('courses')) {
        let courses = JSON.parse(jsData.courses)
        console.log(courses)
        jsData.courses = {}
        for(var i = 0; i < courses.length; i++){
            let course = courses[i]
            jsData.courses[course.pk] = course.fields
        }
    }
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
        window.weekChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 7, "this_week", "weekChart"));
        break;
    case "day":
        window.dayChart = bb.generate(getChartData_dayChart(jsData.study_sessions));
        break;
    case "month":
        window.monthChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 1, 31, "month", "monthChart"));
        break;
    case "year":
        window.monthChart = bb.generate(getChartData_timeBar(jsData.study_sessions, 31, 356, "year", "yearChart"));
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

function getChartData_timeBar(study_sessions, daysInBar, totalBars, dataFrom, elemId){
    let chartData = {
        data: {
            columns: [], // to be filled out
            type: "bar",
            types: {"total": "spline"},
            groups: [[]], // to be filled out
            colors:{}, // to be filled out
        },
        grid: {
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
                    }
                },
            },
            x:{
                type: "category",
                categories: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
            },
        },
        bindto: "#"+elemId
    }
    if (dataFrom == "this_week"){
        chartData.axis.x = {
            type: "category",
            categories: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
        }
    }else if(dataFrom == "month"){
        chartData.axis.x = {
            
        }
    }else if(dataFrom == "year"){
        chartData.axis.x = {
            type: "category",
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        }
    }

    
    let total_days = [0]
    for (const [course_id, session_wrap] of Object.entries(study_sessions)) {
        let classData = {}
        let total_each_day = [0]
        classData.course_name = jsData.courses[course_id].course_name
        classData[dataFrom] = typeof(session_wrap[dataFrom]) == "string" ? JSON.parse(session_wrap[dataFrom]) : session_wrap[dataFrom]
        let dayCount = -1
        let dayMarker = null
        for (var i = 0; i < classData[dataFrom].length; i++){
            let session = classData[dataFrom][i]
            let start = new Date(Date.parse(session.fields.start_date))
            let end = new Date(Date.parse(session.fields.end_date))
            if(dayMarker == null || start.getDate() - dayMarker.getDate() >= daysInBar){
                console.log(start.getDate())
                total_each_day.push(0)
                total_days.push(0)
                dayCount++
            }
            dayMarker = start

            let duration = session.fields.duration
            if(duration != (end.getTime() - start.getTime())/60000) duration =  (end.getTime() - start.getTime())/60000
            duration /= 60
            total_each_day[dayCount] += duration
            total_days[dayCount] += duration
        }

        chartData["data"]["columns"].push([classData.course_name, ...total_each_day])
        chartData["data"]["groups"][0].push(classData.course_name)
    }
    while(total_days.length < (totalBars/daysInBar)){
        total_days.push(0)
    }
    chartData["data"]["columns"].push(["total", ...total_days])
    console.log(chartData)
    //TODO:: let user choose the color for each course
    return chartData
}

function str_fill(str, filler, length, ifFront = true){
    while(str.length < length){
        if(ifFront) str = filler + str
        else str = str + filler
    }
    return str
}

function getChartData_dayChart(study_sessions){
    let chartData = {
        data: {
            order: null,
            columns: [],
            type: "bar",
            groups: [],
            colors:{}, /* "transparent1": "#00000000" */
        },
        tooltip: {
            format: {
                title: function(x) {
                    return d3.timeFormat("%Y-%m-%d %H:%M:%S")(x);
                }
            }
        },
        axis:{
            rotated: true,
            y: {
                max: 24.0,
                padding: {
                    top: 0
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
        bindto: "#dayChart"
    }
    
    let classes_sessions = {}
    let mostSessions = 0
    let courseList = []
    for (const [course_id, session_wrap] of Object.entries(study_sessions)) {
        course_name = jsData.courses[course_id].course_name
        sessions = []
        todaySessions = typeof(session_wrap.today) == "string" ? JSON.parse(session_wrap.today) : session_wrap.today
        if(todaySessions.length > 0){
            var last_end = new Date(Date.parse(todaySessions[0].fields.start_date))
            last_end.setHours(0,0,0,0)
    
            for(var i = 0; i < todaySessions.length; i++){
                let session = todaySessions[i]
                let start = new Date(Date.parse(session.fields.start_date))
                if(start.getTime() > last_end.getTime()){
                    sessions.push(inHours(last_end, start))
                }else sessions.push(0)
                last_end = new Date(Date.parse(session.fields.end_date)) //this is the current end, but for convinence named last_end because it has to go in there eventually
                sessions.push(inHours(start, last_end))
            }
            var end_of_day = new Date(Date.parse(todaySessions[0].fields.start_date));
            end_of_day.setHours(23,59,59,0);
            sessions.push(24-sessions.reduce((a, b) => a + b))
        }

        courseList.push(course_name)
        if(sessions.length <= 0) sessions.push(24)
        classes_sessions[course_id] = {
            "course_name": course_name,
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