from django.urls import path

from . import views

app_name = 'courses'
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:course_id>/', views.detail, name='detail'),
    path('add_course/', views.add_course, name='add_course'),
    path('session/', views.session, name='session'),
    path('list/', views.list, name='list'),
    path('integrations/', views.integrations, name='integrations'),
    path('settings/', views.settings, name='settings'),
    path('analytics/', views.analytics, name='analytics'),
    path('delete_course/', views.delete_course, name='delete_course'),
]
