from django import template
from django.utils.translation import ugettext_lazy as _

from ..models import Subscription

register = template.Library()

@register.simple_tag(takes_context=True)
def get_subscription_example(context):
    s = Subscription.objects.filter(price__gt=0).order_by('period')[:1]
    if s:
        s = s[0]
        return "%s = %.02f &euro;" % (s.name, s.price)
    else:
        return _('No subscriptions available')

@register.simple_tag(takes_context=True)
def get_subscription_options(context):
    html = []
    for s in Subscription.objects.filter(price__gt=0).order_by('period'):
        html.append('<option value="%s" price="%.02f &euro;">%s</option>'%(s.id, s.price, s.name))
    return ''.join(html)
