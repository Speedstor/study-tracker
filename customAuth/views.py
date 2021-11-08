from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout


def index(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('courses:index'))
    else:
        return render(request, 'customAuth/index.html')


def handle_signup(request):
    # Default view
    if request.method == 'GET':
        return render(request, 'customAuth/signup.html')
    # Only handle POSTs
    if request.method != 'POST':
        return HttpResponseRedirect(reverse('customAuth:index'))

    username = request.POST['username']
    email = request.POST['email']
    password = request.POST['password']
    user = User.objects.create_user(username, email=email, password=password)
    user.save()

    # Log the user in
    login(request, user)
    return HttpResponseRedirect(reverse('courses:index'))


def handle_login(request):
    # Render default view
    if request.method == 'GET':
        return render(request, 'customAuth/login.html')
    # Only handle POSTs
    if request.method != 'POST':
        return HttpResponseRedirect(reverse('customAuth:index'))

    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)

    # If logged in, redirect to dashboard view
    if user is not None:
        login(request, user)
        return HttpResponseRedirect(reverse('courses:index'))
    # If login failed, redirect to login page
    else:
        return HttpResponseRedirect(reverse('customAuth:index'))


def handle_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse('customAuth:index'))