from django.urls import path

from . import views

app_name = 'api'
urlpatterns = [
    #sorry for bad coding, but im going to add api access to the database through pages and crsf
    path('session', views.session, name="api_session")
]
