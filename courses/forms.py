from django import forms

class CourseForm(forms.Form):
    course_name = forms.CharField(label='Course name', max_length=200)

