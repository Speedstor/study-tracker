from django.contrib.auth import authenticate
from django import forms
from django.http.response import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from django.forms.models import model_to_dict
from django.core import serializers

from .models import Course, StudySession
from .forms import CourseForm, DeleteCourseForm
from . import queries

from main.settings import STUDY_SESSION_END_TIMEOUT, STUDY_SESSION_END_FORCE_SET_PING_WIGGLE_ROOM

from datetime import datetime
import math


# View for the home page
@login_required
def index(request):
    print(request.user.username, request.user.id)

    # Get this user's courses
    courses = Course.objects.all().filter(user=request.user.id)

    now = timezone.now()
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
@login_required
def detail(request, course_id):
    course = Course.objects.get(pk=course_id)
    sessions = StudySession.objects.filter(course_id=course_id)
    total_time = 0
    for s in sessions:
        total_time += s.duration
    
    now = timezone.now();
    jsData = {
        "study_sessions": [],
        "courses": {},
        "username": request.user.username,
    }
    c = course
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
        "course_id": course.id,
        "course_name": course.course_name, 
        "total_time": math.floor(total_time/360)/10,
        "jsData": jsData,
        "deleteForm": DeleteCourseForm()
    }
    if 'wrong_confirm_str' in request.GET:
        context['notification'] = "To delete course, please type the confirm string correctly"
    return render(request, 'courses/detail.html', context=context)


# View for adding a new course
@login_required
def add_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            # Create course
            name = request.POST['course_name']
            date = timezone.localtime(timezone.now())
            c = Course(user=request.user, course_name=name, date_added=date)
            # Write course to DB
            c.save()

            # Return to home page
            return HttpResponseRedirect(reverse('courses:list'))
    else:
        form = CourseForm()

    context = {'form': form}
    return render(request, 'courses/add_course.html', context=context)

# View for adding a new course
@login_required
def delete_course(request):
    if request.method == 'POST':
        form = DeleteCourseForm(request.POST)
        if 'course_id' in request.POST and 'confirm_str' in request.POST:
            # Create course
            course_id = request.POST['course_id']
            confirm_str = request.POST['confirm_str']
            course = Course.objects.get(pk=course_id)
            need_confirm = request.user.username+"/"+course.course_name
            if confirm_str == need_confirm:
                course.delete()
                return HttpResponseRedirect("%s?delete_success=true" % reverse('courses:list'))
            else:
                redirectLink = reverse('courses:detail', kwargs={'course_id':course_id })
                print(redirectLink)
                if 'next' in request.POST:
                    print(request.POST)
                    redirectLink = request.POST['next']
                    print(redirectLink)
                return HttpResponseRedirect("%s?wrong_confirm_str=true" % redirectLink)
        else:
            return HttpResponseRedirect(reverse('courses:list'))
    else:
        return HttpResponseNotFound() 

@login_required
def list(request):
    courses = [c for c in Course.objects.all().filter(user=request.user)]
    courses = sorted(courses, key=lambda c: c.course_name)
    now = timezone.now()
    jsData = {
        "study_sessions": [],
        "courses": {},
        "username": request.user.username,
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
    if 'delete_success' in request.GET:
        context['notification'] = "successfully deleted a course"
    if 'wrong_confirm_str' in request.GET:
        context['notification'] = "To delete course, please type the confirm string correctly"
    return render(request, 'courses/list.html', context=context)


@login_required
def integrations(request):
    courses = [c for c in Course.objects.all().filter(user=request.user)]
    courses = sorted(courses, key=lambda c: c.course_name)
    now = timezone.now()
    jsData = {
        "study_sessions": [],
        "courses": {},
    }
    for c in courses:
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
    context = {
        'courses': courses,
        'jsData': jsData,
    }
    return render(request, 'courses/integrations.html', context=context)


# !! Old code changed, moved to api/session, to change/create/end session -> need to use api/session instead
# View for a study session with timer
@login_required
def session(request):
    # Get all of the courses to display in the <select> dropdown
    courses = [c for c in Course.objects.all().filter(user=request.user)]
    courses = sorted(courses, key=lambda c: c.course_name)
    print('session courses: ', courses)
    ongoing_session = None
    ongoing_course_id = None

    # these two variables should be in user settings || or be apple, and take the best settings and force it on the user, but still, it should be in a setting with constants, either in code, or from a settings file
    try:
        last_study_session = StudySession.objects.latest('start_date')
        if last_study_session.start_date.strftime('%Y-%m-%d %H:%M:%S') == last_study_session.end_date.strftime(
                '%Y-%m-%d %H:%M:%S'):
            print(last_study_session.start_date.strftime('%Y-%m-%d %H:%M:%S'))
            print((timezone.localtime(timezone.now()) - last_study_session.last_ping).total_seconds() / 60)
            if (timezone.localtime(
                    timezone.now()) - last_study_session.last_ping).total_seconds() / 60 > STUDY_SESSION_END_TIMEOUT:
                # there is an ongoing session that had not been stopped for 90 minutes (study_sesion_end_timeout minutes), we should stop it and say no ongoing_session
                last_study_session.end_date = last_study_session.last_ping + timezone.timedelta(
                    minutes=STUDY_SESSION_END_FORCE_SET_PING_WIGGLE_ROOM)
                last_study_session.set_duration()
                last_study_session.save()
            else:
                ongoing_course_id = last_study_session.course.id
                ongoing_session = serializers.serialize("json", [last_study_session])
        else:
            pass  # there is no ongoing session
    except:
        pass  # the user does not have any session yet, and it would have error when fetching

    jsData = {'courses': {}}
    for c in courses:
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
    context = {'courses': courses, "jsData": jsData}
    if ongoing_session != None:
        context["jsData"]["ongoing_session"] = ongoing_session
        context["jsData"]["ongoing_course_id"] = ongoing_course_id
        # if request.session['course_id']:
    return render(request, 'courses/session.html', context=context)


import pprint

pp = pprint.PrettyPrinter(indent=4)


@login_required
def analytics(request):
    courses = [c for c in Course.objects.all().filter(user=request.user)]
    courses = sorted(courses, key=lambda c: c.course_name)
    now = timezone.now();
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

def settings(request):
    print(request.user.username, request.user.id)
    # Get this user's courses
    courses = Course.objects.all().filter(user=request.user.id)

    jsData = {
        "study_sessions": [],
        "courses": {},
    }
    for c in courses:
        jsData["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
    context = {
        'courses': courses,
        'jsData': jsData,
    }
    return render(request, 'courses/settings.html', context=context)