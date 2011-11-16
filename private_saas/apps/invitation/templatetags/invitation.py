from django import template
from ..models import UserInvitation

register = template.Library()

@register.simple_tag(takes_context=True)
def invited_by(context):
    user = context['user']
    invited_by = None
    for ui in UserInvitation.objects.filter(user=user):
        if ui.invite.user:
            invited_by = ui.invite.user
            break

    return 'UFO' if invited_by is None else invited_by.username
