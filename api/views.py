from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

from courses.models import Course, StudySession
from courses import queries

from datetime import datetime

def CORS_JsonResponse(status, data):
    response = JsonResponse(status = status, data = data)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

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
                                timezone.now()) - last_study_session.last_ping).total_seconds() / 60 > study_session_end_timeout:
                            # there is an ongoing session that had not been stopped for 90 minutes (study_sesion_end_timeout minutes), we should stop it and say no ongoing_session
                            last_study_session.end_date = last_study_session.last_ping + timezone.timedelta(
                                minutes=study_session_end_force_set_ping_wiggle_room)
                            last_study_session.set_duration()
                            last_study_session.save()
                        else:
                            ongoing_session = serializers.serialize("json", [last_study_session])
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