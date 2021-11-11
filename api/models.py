from django.contrib.auth.models import User
from django.db import models
from courses.models import Course


class ExtensionTrackSites(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    siteUrl = models.CharField(max_length=200)

    def __str__(self):
        return self.siteUrl

class ExtensionIdentifierStr(models.Model):
    trackSite = models.ForeignKey(ExtensionTrackSites, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    identifierStr = models.CharField(max_length=200)

    def __str__(self):
        return "("+self.trackSite.siteUrl+") - "+self.course.course_name+" : "+self.identifierStr
