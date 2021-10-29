from django.db import models

# Create your models here.


class Course(models.Model):
    course_name = models.CharField(max_length=200)
    date_added = models.DateTimeField('Date added')

    def __str__(self):
        return self.course_name


class StudySession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    start_date = models.DateTimeField('date started')
    end_date = models.DateTimeField('date ended')
    duration = models.PositiveIntegerField(default=0)  # duration in minutes

    def set_duration(self):
        self.duration = (self.end_date - self.start_date).seconds // 60

    def __str__(self):
        return f'{self.course} study session for {self.duration} minutes'

