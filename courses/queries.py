# Utility functions for selecting a study session based on a time condition
import datetime
from .models import Course, StudySession
from django.utils import timezone

START_OF_WEEK = 0
END_OF_WEEK = 6


def get_study_sessions_last_week(course_id, now):
    course = Course.objects.all().get(pk=course_id)
    start_of_last_week = get_start_of_last_week(now)
    end_of_last_week = get_end_of_last_week(now)
    study_sessions = StudySession.objects.filter(course=course,
                                                 start_date__gte=start_of_last_week,
                                                 end_date__lte=end_of_last_week)
    return study_sessions


def get_study_sessions_this_week(course_id, now):
    course = Course.objects.all().get(pk=course_id)
    start_of_this_week = get_start_of_week(now)
    end_of_this_week = get_end_of_week(now)
    study_sessions = StudySession.objects.filter(course=course,
                                                 start_date__gte=start_of_this_week,
                                                 end_date__lte=end_of_this_week)
    return study_sessions


# Returns the datetime associated with the start of the week for the given datetime.
def get_start_of_week(d: timezone.datetime):
    delta = timezone.timedelta(days=1)
    cur_weekday = d.weekday()
    # Decrement the day until it is the first day of the week
    while cur_weekday != START_OF_WEEK:
        d = d - delta
        cur_weekday = d.weekday()
    return timezone.datetime.replace(d, year=d.year, month=d.month, day=d.day, hour=0, minute=0, second=0,
                                     tzinfo=timezone.utc)


# Returns the datetime associated with the start of the week for the given datetime.
def get_end_of_week(d: timezone.datetime):
    delta = timezone.timedelta(days=1)
    cur_weekday = d.weekday()
    # Increment the day until it is the last day of the week
    while cur_weekday != END_OF_WEEK:
        d = d + delta
        cur_weekday = d.weekday()
    return timezone.datetime.replace(d, year=d.year, month=d.month, day=d.day, hour=23, minute=59, second=59,
                                     tzinfo=timezone.utc)


# Returns the datetime associated with the start of the last week for the given datetime.
def get_start_of_last_week(d: timezone.datetime):
    start_of_this_week = get_start_of_week(d)
    # Subtract one week from the start of this week
    delta = timezone.timedelta(days=7)
    return start_of_this_week - delta


# Returns the datetime associated with the end of the last week for the given datetime.
def get_end_of_last_week(d: timezone.datetime):
    start_of_this_week = get_start_of_week(d)
    # Subtract 1 second from the start of this week
    delta = timezone.timedelta(seconds=1)
    return start_of_this_week - delta
