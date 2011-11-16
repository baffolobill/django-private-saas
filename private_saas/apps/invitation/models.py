import datetime
import random

from django.db import models
from django.conf import settings
from django.utils.translation import ugettext_lazy as _, ungettext
from django.utils.hashcompat import sha_constructor
from django.contrib.auth.models import User

import app_settings
import signals

class InvitationError(Exception):
    pass


class InvitationManager(models.Manager):
    def generate_invite(self, user):
        key = '%s%0.16f%s%s' % (settings.SECRET_KEY,
                                random.random(),
                                user.username,
                                user.email)
        key = sha_constructor(key).hexdigest()

        return key


    def find(self, invitation_key):
        """
        Find a valid invitation for the given key or raise
        ``Invitation.DoesNotExist``.

        This function always returns a valid invitation. If an invitation is
        found but not valid it will be automatically deleted.
        """
        try:
            invitation = self.filter(key=invitation_key)[0]
        except IndexError:
            raise Invitation.DoesNotExist
        if not invitation.valid():
            #invitation.delete()
            raise Invitation.DoesNotExist
        return invitation


class Invitation(models.Model):
    user = models.ForeignKey(User, blank=True, null=True, \
                                related_name='invitations')
    key = models.CharField(_(u'invitation key'), max_length=255, unique=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    expires = models.DateTimeField(null=True, blank=True)
    counter = models.PositiveIntegerField(_(u'counter'), max_length=11, default=0)
    num_allowed_usage = models.PositiveIntegerField(_(u'num allowed usage'), \
                                    max_length=11, default=0)

    objects = InvitationManager()

    class Meta:
        verbose_name = _(u'invitation')
        verbose_name_plural = _(u'invitations')

    def __unicode__(self):
        return self.key

    def estimate(self):
        if self.num_allowed_usage == 0:
            est = unicode(_('unlimited'))
        else:
            est = self.num_allowed_usage - self.counter
            est = est if est > 0 else 0

        usage = '%s %s' % (est, unicode(_('usage')))
        if self.expires is None:
            return usage

        est_days = abs((self.expires - datetime.datetime.now()).days)
        return ungettext('%(usage)s during %(est)s %(unit)s',
                        '%(usage)s during %(est)s %(unit_plural)s', est_days) % \
                        {'usage':usage, 'est':est_days,
                        'unit':'day', 'unit_plural':'days'}

    def expired(self):
        if self.expires is None:
            return False

        return (self.expires < datetime.datetime.now())

    def valid(self):
        return ( (self.num_allowed_usage == 0 \
                    or (self.counter < self.num_allowed_usage)) \
                 and not self.expired() )

class UserInvitation(models.Model):
    invite = models.ForeignKey(Invitation)
    user = models.ForeignKey(User)
    created = models.DateTimeField(auto_now_add=True, editable=False)
