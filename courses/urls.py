from django.urls import path

from . import views

app_name = 'courses'
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:course_id>/', views.detail, name='detail'),
    path('add_course/', views.add_course, name='add_course'),
    path('start_study_session/', views.start_study_session, name='start_study_session'),
    path('session/', views.session, name='session'),
]
