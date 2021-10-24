from django.shortcuts import render
from django.http import HttpResponse
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt

from .models import Course, StudySession
from .forms import CourseForm, StudySessionForm


def index(request):
    courses = Course.objects.all()
    context = {'courses': courses}
    return render(request, 'courses/index.html', context=context)


def detail(request, course_id):
    course = Course.objects.get(pk=course_id)
    sessions = StudySession.objects.filter(course_id=course_id)
    total_time = 0
    for s in sessions:
        total_time += s.duration
    context = {'tempString': f'You are looking at course {course.course_name}. You have spent {total_time} minutes studying for this course.'}
    return render(request, 'courses/placeholder.html', context=context)


def add_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
            # Create course
            name = request.POST['course_name']
            date = timezone.now()
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

def start_study_session(request):
    # Get all of the courses to display in the <select> dropdown
    courses = [c for c in Course.objects.all()]
    courses = sorted(courses, key=lambda c: c.course_name)
    form = StudySessionForm()
    # print(form.as_p())
    context = {'courses': courses, 'form': form}
    return render(request, 'courses/start_study_session.html', context=context)


@csrf_exempt
def session(request):
    session_id = -1
    course_id = -1
    course_name = None

    if request.method == 'POST':
        # for k, v in request.POST.items():
        #     print(k, v)
        if 'course' in request.POST:
            course_id = int(request.POST['course'])
            course_name = Course.objects.get(pk=course_id)

        if 'sessionStatus' in request.POST:
            session_status = request.POST['sessionStatus']
            if session_status == 'started':
                pass
                # Get the course for this session
                course_id = int(request.POST['courseId'])
                course = Course.objects.get(pk=course_id)
                # Create session object and save to DB
                study_session = StudySession(course=course, start_date=timezone.now(), end_date=timezone.now())
                study_session.save()
                session_id = study_session.id
                print('courseId from client =', course_id)
                print('sessionId from server =', session_id)

            elif session_status == 'ended':
                # Get session object, update end date and duration, and save to DB
                session_id = request.POST['sessionId']
                print('sessionId from client is', session_id)
                study_session = StudySession.objects.get(pk=session_id)
                sec_elapsed = int(request.POST['secElapsed'])
                print('secElapsed from client is', str(sec_elapsed))
                end_date = study_session.start_date + timezone.timedelta(seconds=sec_elapsed)
                study_session.end_date = end_date
                study_session.duration = (study_session.end_date - study_session.start_date).seconds // 60
                print('start date = ', study_session.start_date)
                print('end date = ', study_session.end_date)
                print('duration in minutes = ', study_session.duration)

                study_session.save()
                return HttpResponseRedirect(reverse('courses:index'))

    # for k, v in request.POST.items():
    #     print(k, v)
    context = {'courseId': str(course_id)}
    resp = render(request, 'courses/session.html', context=context)
    resp['Access-Control-Allow-Headers'] = ['http_x_csrftoken']
    resp['Access-Control-Allow-Origin'] = '*'
    resp['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    resp['courseId'] = str(course_id)
    resp['sessionId'] = str(session_id)
    resp['courseName'] = course_name
    return resp
