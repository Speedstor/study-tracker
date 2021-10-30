
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
        let chartData = getChartData_weekChart(jsData.study_sessions);
        window.weekChart = bb.generate(chartData);
        chartData = getChartData_dayChart(jsData.study_sessions);
        window.dayChart = bb.generate(chartData);
    }
})

function getChartData_weekChart(study_sessions){
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
            }
        },
        bindto: "#weekChart"
    }
    
    let total_days = [0, 0, 0, 0, 0, 0, 0]
    for (const [course_id, session_wrap] of Object.entries(study_sessions)) {
        let classData = {}
        let total_each_day = [0, 0, 0, 0, 0, 0, 0]
        classData.course_name = jsData.courses[course_id].course_name
        classData.this_week = typeof(session_wrap.this_week) == "string" ? JSON.parse(session_wrap.this_week) : session_wrap.this_week
        let dayCount = -1
        let dayMarker = null
        for (var i = 0; i < classData.this_week.length; i++){
            let session = classData.this_week[i]
            let start = new Date(Date.parse(session.fields.start_date))
            let end = new Date(Date.parse(session.fields.end_date))
            if(dayMarker == null || start.getDate() != dayMarker){
                dayMarker = start.getDate()
                dayCount++
            }

            let duration = session.fields.duration
            if(duration != (end.getTime() - start.getTime())/60000) duration =  (end.getTime() - start.getTime())/60000
            duration /= 60
            total_each_day[dayCount] += duration
            total_days[dayCount] += duration
        }

        chartData["data"]["columns"].push([classData.course_name, ...total_each_day])
        chartData["data"]["groups"][0].push(classData.course_name)
    }
    chartData["data"]["columns"].push(["total", ...total_days])
    //TODO:: let user choose the color for each course
    return chartData
}

function getChartData_dayChart(study_sessions){
    let chartData = {
        data: {
            order: null,
            columns: [
            // ["transparent0", 10, 9, 10.5, 11],
            // ["gap1", 0, 2.00, 2.00, 4.00],
            // ["transparent1", 1.30, 1.00, 0, 2.00],
            // ["gap3", 0, 2.00, 2.00, 0],
            // ["gap4", 1.30, 1.00, 0, 2.00],
            // ["transparent2", 1.30, 1.00, 0, 2.00],
            // ["gap5", 1.30, 1.00, 0, 2.00],
            // ["transparent3", 5, 1.00, 0, 2.00],
            ],
            type: "bar", // for ESM specify as: bar()
            groups: [
                // ["gap1",
                // "gap2",
                // "gap3",
                // "gap4",
                // "gap5",
                // "transparent1",
                // "transparent2",
                // "transparent3",
                // "transparent0",
                // ]
            ],
            colors:{"transparent1": "#00000000"},
        },
        grid: {
            y: {
            lines: [
                {
                value: 0
                }
            ]
            }
        },
        axis:{
            rotated: true,
            x:{
                type: "category",
                categories: [
                    "cat1",
                    "math 18",
                    "cse 11",
                    "math 20c",
                ]
            },
        },
        legend: {
            show: false
        },
        bindto: "#dayChart"
    }
    
    let classes_sessions = {}
    let mostSessions = 0
    for (const [course_id, session_wrap] of Object.entries(study_sessions)) {
        course_name = jsData.courses[course_id].course_name
        sessions = []
        todaySessions = typeof(session_wrap.today) == "string" ? JSON.parse(session_wrap.today) : session_wrap.today
        console.log(todaySessions)
        if(todaySessions.length > 0){
            // let last_end = new Date(1999, 10, 10, 0, 0, 0, 0)
            // last_end.setDate()
            var last_end = new Date(Date.parse(todaySessions[0].fields.start_date));
            last_end.setHours(0,0,0,0);
    
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
            end_of_day.setHours(23,59,59,999);
            sessions.push(inHours(last_end, end_of_day))
        }

        classes_sessions[course_id] = {
            "course_name": course_name,
            "sessions": sessions
        }
        if(sessions.length > mostSessions) mostSessions = sessions.length
    }

    let courseKeys = Object.keys(classes_sessions)
    let columns = []
    let groups = []
    let color = {}
    for(var i = 0; i < mostSessions; i++){
        let current = []
        let dataName = "solid"+i
        if(i % 2 == 0){
            dataName = "transparent"+i
            color[dataName] = "#00000000"
        }
        current.push(dataName)
        groups.push(dataName)
        for (const key of courseKeys) {
            console.log(classes_sessions[key]["sessions"])
            if(i < classes_sessions[key]["sessions"].length){
                //transparent
                current.push(classes_sessions[key]["sessions"][i])
            }else{
                current.push(0)
            }
        }
        columns.push(current)
    }

    chartData.data.columns = columns
    chartData.data.groups.push(groups)
    chartData.data.colors = color
    console.log(classes_sessions)
    console.log(chartData)
    return chartData
}

function inHours(start, end){
    return Math.round((end.getTime() - start.getTime())/36000)/100
}