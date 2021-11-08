from django.contrib.auth.models import User
from django.db import models

# Create your models here.


class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=200)
    date_added = models.DateTimeField('Date added')

    def __str__(self):
        return self.course_name


class StudySession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start_date = models.DateTimeField('date started')
    end_date = models.DateTimeField('date ended')
    last_ping = models.DateTimeField('last pinged')
    duration = models.PositiveIntegerField(default=0)  # duration in minutes

    def set_duration(self):
        endd = self.last_ping if self.end_date.strftime('%Y-%m-%d %H:%M:%S') == self.start_date.strftime('%Y-%m-%d %H:%M:%S') else self.end_date
        self.duration = (endd - self.start_date).seconds

    def __str__(self):
        return f'{self.course} study session for {self.duration} minutes'

