from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

from main.settings import STUDY_SESSION_END_TIMEOUT, STUDY_SESSION_END_FORCE_SET_PING_WIGGLE_ROOM

from courses.models import Course, StudySession
from courses import queries
from .models import ExtensionTrackSites, ExtensionIdentifierStr

import pprint

from datetime import datetime

def CORS_JsonResponse(status, data):
    response = JsonResponse(status = status, data = data)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

pp = pprint.PrettyPrinter(indent=4)

@csrf_exempt
def extension_getDayChart(request):
    courses = Course.objects.all().filter(user=request.user.id)

    now = datetime.utcnow()
    content = {
        "study_sessions": [],
        "courses": {},
    }
    for c in courses:
        c_study_sessions = queries.get_study_sessions_byType(c.id, now, "month")
        content["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
            "date_added": str(c.date_added),
        }
        for ss in c_study_sessions:
            content["study_sessions"].append({
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
    return CORS_JsonResponse(status=202, data=content)


@csrf_exempt
def extension_addTrackSite(request):
    if request.method == 'POST':
        if 'site' in request.POST:
            trackSite = ExtensionTrackSites(user=request.user, siteUrl=request.POST["site"])
            trackSite.save()
            return CORS_JsonResponse(status=202, data={"status": True})
        else:
            return CORS_JsonResponse(status=402, data={"status": "need site POST parameter"})

@csrf_exempt
def extension_addIdentifierStr(request):
    if request.method == 'POST':
        if 'site' in request.POST and 'course_id' in request.POST and 'identifierStr' in request.POST:
            identifierStr = ExtensionIdentifierStr(trackSite=ExtensionTrackSites.objects.filter(siteUrl=request.POST['site']),
                                                course=Course.objects.get(pk=request.POST['course_id']), 
                                                identifierStr=request.POST["identifierStr"])
            identifierStr.save()
            return CORS_JsonResponse(status=202, data={"status": True})
        else:
            return CORS_JsonResponse(status=402, data={"status": "need site POST parameter"})


@csrf_exempt
def extension_settings(request):
    content = {
        "trackSites": [],
        "identifierStrs": {},
        "courses": {}
    }
    courses = Course.objects.all().filter(user=request.user.id)
    for c in courses:
        content["courses"][c.id] = {
            "id": c.id,
            "course_name": c.course_name,
        }

    trackSites = ExtensionTrackSites.objects.all().filter(user=request.user.id)
    for site in trackSites:
        siteUrl = site.siteUrl
        content["trackSites"].append(siteUrl)
        identifierStrs = ExtensionIdentifierStr.objects.filter(trackSite=site)
        content["identifierStrs"][siteUrl] = {}
        for identifierStr in identifierStrs:
            course_id = identifierStr.course.id
            contentStr = identifierStr.identifierStr
            try:
                content["identifierStrs"][siteUrl][course_id].append(contentStr)
            except:
                content["identifierStrs"][siteUrl][course_id] = [contentStr]
    return CORS_JsonResponse(status=202, data=content)

@csrf_exempt
def checkLogin(request):
    if request.user.is_authenticated:
        return CORS_JsonResponse(status=201, data={'status': True})
    else:
        return CORS_JsonResponse(status=201, data={'status': False})


@csrf_exempt
# View for a study session with timer
def session(request):
    print('new session called')
    if request.method == 'POST':
        for k, v in request.POST.items():
            print(k, v)
        if 'courseId' in request.POST:
            # Save the course id in session storage
            request.session['course_id'] = int(request.POST['courseId'])
        if not request.session.get('course_id', None):
            print('did not find course ID')
            return CORS_JsonResponse(status=401, data={'status': "course id is not set yet"})

        # Check if the client has indicated the session status
        if 'sessionStatus' in request.POST:
            session_status = request.POST['sessionStatus']
            if session_status == 'started':
                print('session started')
                # Get the course for this session
                course_id = request.session['course_id']
                course = Course.objects.get(pk=course_id)
                # Create session object and save to DB
                time_now = timezone.now()
                study_session = StudySession(course=course, start_date=timezone.localtime(time_now), end_date=timezone.localtime(time_now), last_ping=timezone.localtime(time_now))
                study_session.save()
                # Store the study session Id in session storage
                request.session['session_id'] = study_session.id
                return CORS_JsonResponse(status=201, data={'status': "success"})
            elif session_status == 'ping':
                course_id = request.session['course_id']
                ongoing_session = None
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
                            ongoing_session = last_study_session
                    else:
                        pass  # there is no ongoing session
                except:
                    pass  # the user does not have any session yet, and it would have error when fetching

                if ongoing_session != None:
                    study_session = ongoing_session
                    study_session.last_ping = timezone.localtime(timezone.now())
                    study_session.set_duration()
                    study_session.save()
                else:
                    pass
                study_sessions = queries.get_study_sessions_byType(course_id, datetime.utcnow(), "month")
                
                return CORS_JsonResponse(status=202, data={'status': "success", "study_sessions": serializers.serialize("json", study_sessions)})
            elif session_status == 'ended':
                print('session ended')
                print('course id at end is ', request.session['course_id'])
                if not request.session.get('session_id', None):
                    last_study_session = StudySession.objects.latest('start_date')
                    if last_study_session.start_date.strftime('%Y-%m-%d %H:%M:%S') == last_study_session.end_date.strftime('%Y-%m-%d %H:%M:%S'):
                        ongoing_session_id = last_study_session.id
                    else:
                        return CORS_JsonResponse(status=401, data={'status': "bad request"})
                else:
                    ongoing_session_id = request.session['session_id']


                print('session id at end is ',ongoing_session_id)

                #removed code that sets secElapse from POST parameter to automatic
                    #decided from the time of POST request for the end date

                # Get session object, update end date and duration, and save to DB
                study_session = StudySession.objects.get(pk=ongoing_session_id)
                study_session.end_date = timezone.localtime(timezone.now())
                study_session.set_duration()
                study_session.save()

                # Return user to home page - JavaScript will handle this
                redirect_url = reverse('courses:index')
                return CORS_JsonResponse(status=302, data={'redirectURL': redirect_url})
            else:
                print('sessionStatus unrecognized: ', session_status)

    print('request method is ', request.method)
    return CORS_JsonResponse(status=401, data={'status': "bad request"})