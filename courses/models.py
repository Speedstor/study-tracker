from django.db import models

# Create your models here.
class Course(models.Model):
    Course = models.CharField(max_length = 200)
    dateAdded = models.DateTimeField('Date added')

    def __str__(self):
        return self.Course