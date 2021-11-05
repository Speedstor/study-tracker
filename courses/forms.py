from django import forms
from .models import Course


class CourseForm(forms.Form):
    course_name = forms.CharField(label='Course name', max_length=200)


class StudySessionForm(forms.Form):
    form_user = None

    def __init__(self, *args, **kwargs):
        super(StudySessionForm, self).__init__()
        self.user = kwargs.pop('user')
        choices = [(c.id, c.course_name) for c in Course.objects.all().filter(user=self.user)]
        choices = sorted(choices, key=lambda c: c[1])
        # choices = []  # uncomment this line and comment out the one above when restarting a database
        self.fields['choices'].widget = choices

    # course = forms.ChoiceField(choices=choices)
