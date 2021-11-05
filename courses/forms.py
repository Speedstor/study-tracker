from django import forms
from .models import Course


class CourseForm(forms.Form):
    course_name = forms.CharField(label='Course name', max_length=200)


class StudySessionForm(forms.Form):
    choices = [(c.id, c.course_name) for c in Course.objects.all()]
    choices = sorted(choices, key=lambda c: c[1])
    course = forms.ChoiceField(choices=choices)
