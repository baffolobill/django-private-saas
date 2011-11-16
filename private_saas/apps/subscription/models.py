import datetime

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User, Group
from django.utils.translation import ugettext as _, ungettext, ugettext_lazy

import signals, utils

class Order(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True, editable=False)
    user = models.ForeignKey(User, null=True, blank=True, editable=False)
    subscription = models.ForeignKey('Subscription',
                                     null=True, blank=True, editable=False)
    payment_method = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=64, decimal_places=2,
                                 null=True, blank=True, editable=False)
    status = models.CharField(max_length=255)
    comment = models.TextField(blank=True)


class Transaction(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True, editable=False)
    subscription = models.ForeignKey('Subscription',
                                     null=True, blank=True, editable=False)
    promocode = models.ForeignKey('Promocode', null=True, blank=True, editable=False)
    user = models.ForeignKey(User, null=True, blank=True, editable=False)
    order = models.ForeignKey(Order, null=True, blank=True, editable=False)
    event = models.CharField(max_length=100, editable=False)
    amount = models.DecimalField(max_digits=64, decimal_places=2,
                                 null=True, blank=True, editable=False)
    period = models.PositiveIntegerField(max_length=11, default=0)
    bonus = models.PositiveIntegerField(max_length=11, default=0)
    comment = models.TextField(blank=True, default='')

    class Meta:
        ordering = ('-timestamp',)


_recurrence_unit_days = {
    'D' : 1.,
    'W' : 7.,
    'M' : 30.4368,                      # http://en.wikipedia.org/wiki/Month#Julian_and_Gregorian_calendars
    'Y' : 365.2425,                     # http://en.wikipedia.org/wiki/Year#Calendar_year
}

_TIME_UNIT_CHOICES = (
    ('D', ugettext_lazy('Day')),
    ('W', ugettext_lazy('Week')),
    ('M', ugettext_lazy('Month')),
    ('Y', ugettext_lazy('Year')),
)

_PLURAL_UNITS = {
    'D': 'days',
    'W': 'weeks',
    'M': 'months',
    'Y': 'years',
}

class Promocode(models.Model):
    name = models.CharField(max_length=100, null=False)
    description = models.TextField(blank=True)
    period = models.PositiveIntegerField(null=True, blank=True)
    unit = models.CharField(max_length=1, null=True,
                            choices=((None, ugettext_lazy("No recurrence")),)
                                       + _TIME_UNIT_CHOICES)
    key = models.CharField(max_length=100, null=False, unique=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    expires = models.DateTimeField(null=True, blank=True)
    num_allowed_usage = models.PositiveIntegerField(max_length=11, default=0)
    counter = models.PositiveIntegerField(max_length=11, default=0)

    def __unicode__(self):
        return self.name

    def expired(self):
        if self.expires is None:
            return False

        return (self.expires < datetime.datetime.now())

    def valid(self):
        return ( (self.num_allowed_usage == 0 \
                    or (self.counter < self.num_allowed_usage)) \
                 and not self.expired() )

    def get_promocode_display(self):
        if self.period:
            return ungettext('One %(unit)s',
                             '%(period)d %(unit_plural)s',
                             self.period) % {
                'unit':self.get_unit_display().lower(),
                'unit_plural':_(_PLURAL_UNITS[self.unit],),
                'period':self.period,
                }
        else:
            return _("No bonus by promo")

    def activate(self, user):
        if not self.valid():
            return False, _('Promocode is expired.')

        if self.period == 0:
            return False, _("It's a fake promocode on zero days.")

        # only 1 activataion per user is allowed
        if len(Transaction.objects.filter(user=user, promocode=self)) > 0:
            return False, _('You already activate this promocode.')

        us = user.get_usersubscription()
        if not us:
            return False, _('You dont have a subscription. Please contact with admins.')


        us.expires = utils.extend_date_by(us.expires, self.period, self.unit)
        us.save()

        Transaction(user=user,
                    promocode=self,
                    event='Extend subscription by promocode on %s' % self.get_promocode_display(),
                    period=self.period
                    ).save()

        self.counter += 1
        self.save()

        return True, _('Promocode has been activated on %s.' % self.get_promocode_display())


class Subscription(models.Model):
    name = models.CharField(max_length=100, unique=True, null=False)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=64, decimal_places=2)
    period = models.PositiveIntegerField(null=True, blank=True)
    unit = models.CharField(max_length=1, null=True,
                            choices=((None, ugettext_lazy("No recurrence")),)
                                       + _TIME_UNIT_CHOICES)
    bonus_period = models.PositiveIntegerField(null=True, blank=True)
    bonus_unit = models.CharField(max_length=1, null=True,
                                choices=((None, ugettext_lazy("No recurrence")),)
                                       + _TIME_UNIT_CHOICES)
    group = models.ForeignKey(Group, null=False, blank=False)



    class Meta:
        ordering = ('price','-period')

    def __unicode__(self):
        return self.name

    def get_pricing_display(self):
        if not self.price:
            return u'Free'
        elif self.period:
            return ungettext('%(price).02f / %(unit)s',
                             '%(price).02f / %(period)d %(unit_plural)s',
                             self.period) % {
                'price':self.price,
                'unit':self.get_unit_display(),
                'unit_plural':_(_PLURAL_UNITS[self.unit],),
                'period':self.period,
                }
        else:
            return _('%(price).02f one-time fee') % { 'price':self.price }

    def get_bonus_display(self):
        if self.bonus_period:
            return ungettext('One %(unit)s',
                             '%(period)d %(unit_plural)s',
                             self.bonus_period) % {
                'unit':self.get_bonus_unit_display().lower(),
                'unit_plural':_(_PLURAL_UNITS[self.bonus_unit],),
                'period':self.bonus_period,
                }
        else:
            return _("No bonus")



class ActiveUSManager(models.Manager):
    """Custom Manager for UserSubscription that returns only live US objects."""
    def get_query_set(self):
        return super(ActiveUSManager, self).get_query_set().filter(active=True)

class UserSubscription(models.Model):
    user = models.OneToOneField(User)
    expires = models.DateField(null = True, default=datetime.date.today)
    active = models.BooleanField(default=True)
    cancelled = models.BooleanField(default=True)

    objects = models.Manager()
    active_objects = ActiveUSManager()


    def estimate(self):
        delta = (self.expires - datetime.date.today()).days

        return 0 if delta < 0 else delta

    def expired(self):
        """Returns true if there is more than SUBSCRIPTION_GRACE_PERIOD
        days after expiration date."""
        return self.expires is not None and (
            self.expires < datetime.date.today() )
    expired.boolean = True

    def valid(self):
        return not self.expired()

    def unsubscribe(self, subscription):
        """Unsubscribe user."""
        self.user.groups.remove(subscription.group)
        self.user.save()

    def subscribe(self, subscription):
        """Subscribe user."""
        self.user.groups.add(subscription.group)
        self.user.save()

    def extend(self, timedelta=None, subscription=None):
        """Extend subscription by `timedelta' or by subscription's
        recurrence period."""
        if timedelta is not None:
            self.expires += timedelta
        else:
            if subscription is not None:
                fl = False
                if subscription.unit and subscription.period:
                    self.expires = utils.extend_date_by(
                        self.expires,
                        subscription.period,
                        subscription.unit)
                    fl = True

                if subscription.bonus_unit \
                    and subscription.bonus_period:
                    self.expires = utils.extend_date_by(
                        self.expires,
                        subscription.bonus_period,
                        subscription.bonus_unit)
                    fl = True

                if not fl: self.expires = None




    def __unicode__(self):
        rv = u"%s's subscription estimated days: %s" % (self.user, self.estimate())

        return rv

# add User.get_usersubscription() method
def __user_get_usersubscription(user):
    if not hasattr(user, '_usersubscription_cache'):
        user._usersubscription_cache = None
        for us in UserSubscription.active_objects.filter(user=user):
            if us.valid():
                user._usersubscription_cache = us
                break

    return user._usersubscription_cache
User.add_to_class('get_usersubscription', __user_get_usersubscription)
