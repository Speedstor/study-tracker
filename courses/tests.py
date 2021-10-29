from django.test import TestCase
from django.utils import timezone
from .models import Course, StudySession

# Create your tests here.

class StudySessionTests(TestCase):

    def test_set_duration(self):
        # Create a course so we can associate a study session with it
        course = Course(course_name='TestCourse', date_added=timezone.now())
        course.save()

        start = timezone.now()
        delta = timezone.timedelta(minutes=25)
        end = start + delta
        study_session = StudySession(course=course, start_date=start, end_date=end)
        study_session.set_duration()
        self.assertEqual(25, study_session.duration)

