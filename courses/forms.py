from django import forms

class CourseForm(forms.Form):
    course_name = forms.CharField(label='Course name', max_length=200)

class DeleteCourseForm(forms.Form):
    course_id = forms.IntegerField(label="course_id")
    confirm_str = forms.CharField(label='course_str', max_length=220)

