from django.test import TestCase
from django.urls import reverse


class AuthTests(TestCase):
    def test_courses_redirect(self):
        # Tests that the user is redirected to the auth page if they are not logged in
        resp = self.client.get(reverse('courses:index'))
        self.assertRedirects(resp, '/customAuth/?next=/courses/')

    def test_login_without_signup(self):
        # Tests that a login without prior signup redirects to the auth page
        data = {
            'username': 'testUser',
            'password': 'testUserPwd123!',
        }
        # Attempt login
        resp = self.client.post(reverse('customAuth:handle_login'), data=data)
        self.assertRedirects(resp, '/customAuth/')

    def test_signup(self):
        # Tests that a signup redirects to the home page
        data = {
            'username': 'testUser',
            'email': 'testUser@gmail.com',
            'password': 'testUserPwd123!',
        }
        # Attempt signup
        resp = self.client.post(reverse('customAuth:handle_signup'), data=data)
        self.assertRedirects(resp, '/courses/')

    def test_login_after_logout(self):
        # Tests that an existing user can login after having created an account
        data = {
            'username': 'testUser',
            'email': 'testUser@gmail.com',
            'password': 'testUserPwd123!',
        }
        # Attempt signup
        resp = self.client.post(reverse('customAuth:handle_signup'), data=data)
        self.assertRedirects(resp, '/courses/')

        # Logout
        self.client.logout()

        # Attempt login - should redirect to home page
        data = {
            'username': 'testUser',
            'password': 'testUserPwd123!',
        }
        resp = self.client.post(reverse('customAuth:handle_login'), data=data)
        self.assertRedirects(resp, '/courses/')



