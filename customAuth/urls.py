from django.urls import path

from . import views

app_name = 'customAuth'
urlpatterns = [
    path('', views.index, name='index'),
    path('handle_signup/', views.handle_signup, name='handle_signup'),
    path('handle_login/', views.handle_login, name='handle_login'),
    path('handle_logout/', views.handle_logout, name='handle_logout'),

]