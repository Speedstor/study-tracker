from django.http.response import HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.core import serializers

from .models import Course, StudySession
from .forms import CourseForm, StudySessionForm
from . import queries

from datetime import datetime

# View for the home page
def index(request):
    courses = Course.objects.all()
    now = datetime.utcnow();
    jsData = {
        "study_sessions": [],
        "courses": {},
    }
    for c in courses:
        c_study_sessions = queries.get_study_sessions_byType(c.id, now, "month")
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
        for ss in c_study_sessions:
            pp.pprint(ss)
            jsData["study_sessions"].append({
                "course_name": c.course_name,
                "course_id": c.id,
                'session': {
                    'id': ss.id,
                    'start_date': str(ss.start_date),
                    'end_date': str(ss.end_date),
                    'last_ping': str(ss.last_ping),
                    'duration': ss.duration
                },
            })
    context = {
        'courses': courses,
        'jsData': jsData,
    }
    return render(request, 'courses/index.html', context=context)


# View for a specific course's statistics
def detail(request, course_id):
    course = Course.objects.get(pk=course_id)
    sessions = StudySession.objects.filter(course_id=course_id)
    total_time = 0
    for s in sessions:
        total_time += s.duration
    context = {
        'tempString': f'You are looking at course {course.course_name}. You have spent {total_time} minutes studying for this course.'
    }
    return render(request, 'courses/placeholder.html', context=context)


# View for adding a new course
def add_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            # Create course
            name = request.POST['course_name']
            date = timezone.localtime(timezone.now())
            c = Course(course_name=name, date_added=date)
            # Write course to DB
            c.save()

            # Return to home page
            return HttpResponseRedirect(reverse('courses:index'))
    else:
        form = CourseForm()

    context = {'form': form}
    return render(request, 'courses/add_course.html', context=context)


def list(request):
    courses = Course.objects.all()
    context = {'courses': courses}
    return render(request, 'courses/list.html', context=context)


# !! Deprecated - session would only be on session.html
# View for choosing a course to study for
def start_study_session(request):
    # Get all of the courses to display in the <select> dropdown
    courses = [c for c in Course.objects.all()]
    courses = sorted(courses, key=lambda c: c.course_name)
    form = StudySessionForm()
    # print(form.as_p())
    context = {'courses': courses, 'form': form}
    return render(request, 'courses/start_study_session.html', context=context)


# !! Old code changed, moved to api/session, to change/create/end session -> need to use api/session instead
# View for a study session with timer
def session(request):
    # Get all of the courses to display in the <select> dropdown
    courses = [c for c in Course.objects.all()]
    courses = sorted(courses, key=lambda c: c.course_name)
    form = StudySessionForm()  # form.as_p()
    ongoing_session = None

    #these two variables should be in user settings || or be apple, and take the best settings and force it on the user, but still, it should be in a setting with constants, either in code, or from a settings file
    study_session_end_timeout = 90
    study_session_end_force_set_ping_wiggle_room = 12

    try:
        last_study_session = StudySession.objects.latest('start_date')
        if last_study_session.start_date.strftime('%Y-%m-%d %H:%M:%S') == last_study_session.end_date.strftime('%Y-%m-%d %H:%M:%S'):
            print(last_study_session.start_date.strftime('%Y-%m-%d %H:%M:%S'))
            print((timezone.localtime(timezone.now()) - last_study_session.last_ping).total_seconds() / 60)
            if (timezone.localtime(timezone.now()) - last_study_session.last_ping).total_seconds() / 60 > study_session_end_timeout:
                # there is an ongoing session that had not been stopped for 90 minutes (study_sesion_end_timeout minutes), we should stop it and say no ongoing_session
                last_study_session.end_date = last_study_session.last_ping + timezone.timedelta(minutes=study_session_end_force_set_ping_wiggle_room)
                last_study_session.set_duration()
                last_study_session.save()
            else:
                ongoing_session = serializers.serialize("json", [last_study_session])
        else:
            pass # there is no ongoing session
    except:
        pass # the user does not have any session yet, and it would have error when fetching

    jsData = {'courses': {}}
    for c in courses:
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
    context = {'courses': courses, 'form': form, "jsData": jsData}
    if ongoing_session != None:
        context["jsData"]["ongoing_session"] = ongoing_session
        if request.session['course_id']:
            context["jsData"]["ongoing_course_id"] = request.session['course_id']
    return render(request, 'courses/session.html', context=context)

import pprint
pp = pprint.PrettyPrinter(indent=4)

def analytics(request):
    courses = [c for c in Course.objects.all()]
    courses = sorted(courses, key=lambda c: c.course_name)
    now = datetime.utcnow();
    jsData = {
        "study_sessions": [],
        "courses": {},
    }
    for c in courses:
        c_study_sessions = queries.get_study_sessions_byType(c.id, now, "year")
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
        for ss in c_study_sessions:
            jsData["study_sessions"].append({
                "course_name": c.course_name,
                "course_id": c.id,
                'session': {
                    'id': ss.id,
                    'start_date': str(ss.start_date),
                    'end_date': str(ss.end_date),
                    'last_ping': str(ss.last_ping),
                    'duration': ss.duration
                },
            })
    context = {
        'courses': courses,
        'jsData': jsData,
    }
    return render(request, 'courses/analytics.html', context=context)