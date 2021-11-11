from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User

from .models import Course, StudySession
from .queries import get_study_sessions_this_week, get_study_sessions_last_week

class StudySessionTests(TestCase):

    def test_set_duration(self):
        # Create a course so we can associate a study session with it
        course = Course(course_name='TestCourse', date_added=timezone.localtime(timezone.now()))
        course.save()

        # Set the duration
        start = timezone.localtime(timezone.now())
        delta = timezone.timedelta(minutes=25)
        end = start + delta
        study_session = StudySession(course=course, start_date=start, end_date=end, last_ping=end)
        study_session.set_duration()

        self.assertEqual(25, study_session.duration)

    def test_study_sessions_this_week(self):
        # Create a course so we can associate a study session with it
        course = Course(course_name='TestCourse', date_added=timezone.localtime(timezone.now()))
        course.save()

        now = timezone.datetime(year=2021, month=10, day=25, tzinfo=timezone.utc)

        this_week_dates = [
            timezone.datetime(year=2021, month=10, day=26, tzinfo=timezone.utc),
            timezone.datetime(year=2021, month=10, day=27, tzinfo=timezone.utc),
            timezone.datetime(year=2021, month=10, day=28, tzinfo=timezone.utc),
        ]

        other_dates = [
            timezone.datetime(year=2021, month=11, day=1, tzinfo=timezone.utc),  # next week
            timezone.datetime(year=2021, month=10, day=18, tzinfo=timezone.utc),  # last week
        ]

        # Create study sessions
        this_week_ids = []
        other_ids = []
        delta = timezone.timedelta(minutes=25)
        for d in this_week_dates:
            study_session = StudySession(course=course, start_date=d, end_date=d + delta, last_ping=d + delta)
            study_session.set_duration()
            study_session.save()
            this_week_ids.append(study_session.id)
        for d in other_dates:
            study_session = StudySession(course=course, start_date=d, end_date=d + delta, last_ping=d + delta)
            study_session.set_duration()
            study_session.save()
            other_ids.append(study_session.id)

        # Verify that the courses returned are correct
        sessions = get_study_sessions_this_week(course.id, now)
        self.assertSetEqual(set(this_week_ids), {s.id for s in sessions})

    def test_study_sessions_last_week(self):
        # Create a course so we can associate a study session with it
        course = Course(course_name='TestCourse', date_added=timezone.localtime(timezone.now()))
        course.save()

        now = timezone.datetime(year=2021, month=10, day=25, tzinfo=timezone.utc)

        last_week_dates = [
            timezone.datetime(year=2021, month=10, day=18, tzinfo=timezone.utc),
            timezone.datetime(year=2021, month=10, day=19, tzinfo=timezone.utc),
            timezone.datetime(year=2021, month=10, day=20, tzinfo=timezone.utc),
        ]

        other_dates = [
            timezone.datetime(year=2021, month=10, day=10, tzinfo=timezone.utc),  # over a week old
            timezone.datetime(year=2021, month=10, day=25, tzinfo=timezone.utc),  # this week
            timezone.datetime(year=2021, month=11, day=1, tzinfo=timezone.utc),  # next week
        ]

        # Create study sessions
        last_week_ids = []
        other_ids = []
        delta = timezone.timedelta(minutes=25)
        for d in last_week_dates:
            study_session = StudySession(course=course, start_date=d, end_date=d + delta, last_ping=d + delta)
            study_session.set_duration()
            study_session.save()
            last_week_ids.append(study_session.id)
        for d in other_dates:
            study_session = StudySession(course=course, start_date=d, end_date=d + delta, last_ping=d + delta)
            study_session.set_duration()
            study_session.save()
            other_ids.append(study_session.id)

        # Verify that the courses returned are correct
        sessions = get_study_sessions_last_week(course.id, now)
        self.assertSetEqual(set(last_week_ids), {s.id for s in sessions})


class DashboardTests(TestCase):
    USER_1 = 'testUser'
    PWD_1 = 'testUserPwd123!'
    USER_2 = 'otherUser'
    PWD_2 = 'otherUserPwd123'

    def setUp(self):
        # Create some user accounts before the tests
        user1 = User.objects.create_user(username=DashboardTests.USER_1, password=DashboardTests.PWD_1)
        user2 = User.objects.create_user(username=DashboardTests.USER_2, password=DashboardTests.PWD_2)
        user1.save()
        user2.save()

    def test_add_course(self):
        self.client.login(username=DashboardTests.USER_1, password=DashboardTests.PWD_1)
        # Navigate to add courses page
        resp = self.client.get(reverse('courses:add_course'))
        self.assertEqual(200, resp.status_code)

        # The course should not exist yet
        course_name_to_add = 'TestCourseName'
        self.assertNotContains(resp, course_name_to_add)

        # Add a course - should redirect to home page
        data = {'course_name': course_name_to_add}
        resp = self.client.post(reverse('courses:add_course'), data=data)
        self.assertRedirects(resp, '/courses/')

        # Newly added course should be visible
        resp = self.client.get(reverse('courses:index'))
        self.assertContains(resp, course_name_to_add)

    def test_different_users_see_own_courses(self):
        self.client.login(username=DashboardTests.USER_1, password=DashboardTests.PWD_1)
        course1 = 'Course 1'
        course2 = 'Course 2'

        # Add a course
        data = {'course_name': course1}
        self.client.post(reverse('courses:add_course'), data=data)
        # Newly added course should be visible
        resp = self.client.get(reverse('courses:index'))
        self.assertContains(resp, course1)

        # Login as different user
        self.client.logout()
        self.client.login(username=DashboardTests.USER_2, password=DashboardTests.PWD_2)

        # Add a course
        data = {'course_name': course2}
        self.client.post(reverse('courses:add_course'), data=data)
        # Newly added course should be visible
        resp = self.client.get(reverse('courses:index'))
        self.assertContains(resp, course2)
        # Other user's course should not be visible
        self.assertNotContains(resp, course1)

        # Login as first user
        self.client.logout()
        self.client.login(username=DashboardTests.USER_1, password=DashboardTests.PWD_1)
        # Second user's course should not be visible
        resp = self.client.get(reverse('courses:index'))
        self.assertContains(resp, course1)
        # Other user's course should not be visible
        self.assertNotContains(resp, course2)





