import os
import datetime

from django import template
from django.conf import settings
from django.utils.translation import ugettext as _
from django.utils.safestring import mark_safe

register = template.Library()

tmpl = lambda t: "extra/templatetags/%s.html" % t


@register.inclusion_tag(tmpl('buttons/dropdown'), takes_context=False)
def dropdown(button, items_html=''):
    """
    button = {
        'classes':'',
        'href':'#item_id',
        'actions':{'onclick':''},
        'title':'',
        'label':'',
        }
    items = {
        'id':'',
        'classes':'',
        'rows':[
          {'id':'',
           'classes':'',
           'href':'',
           'actions':{'onclick':''},
           'title':'',
           'label':''},    
          ]
          }
    """
    
    return {'button':button,
            'items_html':items_html}

@register.inclusion_tag(tmpl('buttons/dropdown'), takes_context=False)
def dropdown_with_button_html(button_html, items_html=''):
    return {'button_html':button_html,
            'items_html':items_html}

@register.inclusion_tag(tmpl('buttons/dropdown_with_button'), takes_context=False)
def dropdown_with_button(button, items_html=''):
    return {'button':button,
            'items_html':items_html}

@register.inclusion_tag(tmpl('buttons/context_menu_for_dropdown'), takes_context=True)
def generate_context_menu_for_dropdown(context, items):
    return {'items':items}


