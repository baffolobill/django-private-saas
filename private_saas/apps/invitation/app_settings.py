from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.importlib import import_module



INVITE_ONLY = getattr(settings, 'INVITATION_INVITE_ONLY', False)
EXPIRE_DAYS = getattr(settings, 'INVITATION_EXPIRE_DAYS', 15)
INITIAL_INVITATIONS = getattr(settings, 'INVITATION_INITIAL_INVITATIONS', 10)

