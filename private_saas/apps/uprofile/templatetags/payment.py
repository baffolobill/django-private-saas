from django import template

register = template.Library()

@register.simple_tag(takes_context=True)
def paid_days(context):
    user = context['user']

    return user.get_usersubscription().estimate()
