from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt

from .models import Course, StudySession
from .forms import CourseForm, StudySessionForm


# View for the home page
def index(request):
    print('in function index')
    courses = Course.objects.all()
    context = {'courses': courses}
    return render(request, 'courses/index.html', context=context)


# View for a specific course's statistics
def detail(request, course_id):
    course = Course.objects.get(pk=course_id)
    sessions = StudySession.objects.filter(course_id=course_id)
    total_time = 0
    for s in sessions:
        total_time += s.duration
    context = {
        'tempString': f'You are looking at course {course.course_name}. You have spent {total_time} minutes studying for this course.'}
    return render(request, 'courses/placeholder.html', context=context)


# View for adding a new course
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


# View for choosing a course to study for
def start_study_session(request):
    # Get all of the courses to display in the <select> dropdown
    courses = [c for c in Course.objects.all()]
    courses = sorted(courses, key=lambda c: c.course_name)
    form = StudySessionForm()
    # print(form.as_p())
    context = {'courses': courses, 'form': form}
    return render(request, 'courses/start_study_session.html', context=context)


@csrf_exempt
# View for a study session with timer
def session(request):
    if request.method == 'POST':
        if 'course' in request.POST:
            # Save the course id in session storage
            request.session['course_id'] = int(request.POST['course'])
        # Check if the client has indicated the session status
        if 'sessionStatus' in request.POST:
            session_status = request.POST['sessionStatus']
            if session_status == 'started':
                print('session started')
                # Get the course for this session
                course_id = request.session['course_id']
                course = Course.objects.get(pk=course_id)
                # Create session object and save to DB
                study_session = StudySession(course=course, start_date=timezone.now(), end_date=timezone.now())
                study_session.save()
                # Store the study session Id in session storage
                request.session['session_id'] = study_session.id
            elif session_status == 'ended':
                print('session ended')
                print('course id at end is ', request.session['course_id'])
                print('session id at end is ', request.session['session_id'])

                sec_elapsed = int(request.POST['secElapsed'])
                print('secElapsed from client is', str(sec_elapsed))

                # Get session object, update end date and duration, and save to DB
                study_session = StudySession.objects.get(pk=request.session['session_id'])
                end_date = study_session.start_date + timezone.timedelta(seconds=sec_elapsed)
                study_session.end_date = end_date
                study_session.duration = (study_session.end_date - study_session.start_date).seconds // 60
                study_session.save()

                # Return user to home page
                return HttpResponseRedirect('/courses/')
            else:
                print('sessionStatus unrecognized: ', session_status)


    return render(request, 'courses/session.html')
