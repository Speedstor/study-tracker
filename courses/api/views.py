from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

from ..models import Course, StudySession
from .. import queries

from datetime import datetime


@csrf_exempt
@login_required
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
            return JsonResponse(status=404, data={'status': "course id is not set yet"})

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
                return JsonResponse(status=201, data={'status': "success"})
            elif session_status == 'ping':
                study_session = StudySession.objects.get(pk=request.session['session_id'])
                study_session.last_ping = timezone.localtime(timezone.now())
                study_session.set_duration()
                study_session.save()
                return JsonResponse(status=202, data={'status': "success"})
            elif session_status == 'ended':
                print('session ended')
                print('course id at end is ', request.session['course_id'])
                print('session id at end is ', request.session['session_id'])

                #removed code that sets secElapse from POST parameter to automatic
                    #decided from the time of POST request for the end date

                # Get session object, update end date and duration, and save to DB
                study_session = StudySession.objects.get(pk=request.session['session_id'])
                study_session.end_date = timezone.localtime(timezone.now())
                study_session.set_duration()
                study_session.save()

                # Return user to home page - JavaScript will handle this
                redirect_url = reverse('courses:index')
                return JsonResponse(status=302, data={'redirectURL': redirect_url})
            else:
                print('sessionStatus unrecognized: ', session_status)

    print('request method is ', request.method)
    return JsonResponse(status=404, data={'status': "bad request"})
