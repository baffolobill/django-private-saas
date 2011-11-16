import re

from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from registration.forms import RegistrationForm, RegistrationFormUniqueEmail
from captcha.fields import CaptchaField
from captcha.widgets import CaptchaImage

from .models import Invitation, UserInvitation
import app_settings

def save_user(form_instance, profile_callback=None):
    """
    Create a new **active** user from form data.

    This method is intended to replace the ``save`` of
    ``django-registration``s ``RegistrationForm``. Calls
    ``profile_callback`` if provided. Required form fields
    are ``username``, ``email`` and ``password1``.
    """
    username = form_instance.cleaned_data['username']
    email = form_instance.cleaned_data['email']
    password = form_instance.cleaned_data['password1']
    new_user = User.objects.create_user(username, email, password)
    new_user.save()
    if profile_callback is not None:
        profile_callback(user=new_user)

    if form_instance.invite_obj:
        form_instance.invite_obj.counter += 1
        form_instance.invite_obj.save()

        ui, created = UserInvitation.objects.get_or_create(user=new_user,
                            invite=form_instance.invite_obj)

    # create user invite
    inv_key = Invitation.objects.generate_invite(new_user)
    inv, created = Invitation.objects.get_or_create(user=new_user, key=inv_key, \
                        num_allowed_usage=app_settings.INITIAL_INVITATIONS)

    return new_user


class InvitationForm(forms.Form):
    email = forms.EmailField()


class RegistrationFormInvitation(RegistrationFormUniqueEmail):
    invite = forms.CharField()
    captcha = CaptchaField(widget=CaptchaImage)

    def __init__(self, *args, **kwargs):
        super(RegistrationFormInvitation, self).__init__(*args, **kwargs)
        self.invite_obj = None

    # override parent function
    def clean(self):
        return self.cleaned_data

    def clean_password2(self):
        """
        Verifiy that the values entered into the two password fields
        match. Note that an error here will end up in
        ``non_field_errors()`` because it doesn't apply to a single
        field.

        """
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two password fields didn't match."))
        return self.cleaned_data


    def clean_invite(self):
        try:
            self.invite_obj = Invitation.objects.find(self.cleaned_data['invite'])
            return self.cleaned_data['invite']
        except Invitation.DoesNotExist:
            pass

        raise forms.ValidationError(_('Bad invite code.'))

    save = save_user
