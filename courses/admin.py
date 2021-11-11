from django.contrib import admin
from .models import Course, StudySession
from api.models import ExtensionTrackSites, ExtensionIdentifierStr

# Register your models here.
admin.site.register(Course)
admin.site.register(StudySession)
admin.site.register(ExtensionTrackSites)
admin.site.register(ExtensionIdentifierStr)
