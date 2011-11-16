from django import template
from django.utils.translation import ugettext_lazy as _

register = template.Library()

@register.inclusion_tag('menu/mainnav.html', takes_context=True)
def mainnav(context):
	items = [{'name':'evideo',
				'href':'/evideo/',
				'title':_('Education Video'),
				'label':'evideo',
				'classes':'',
				'disabled':True},

				{'name':'models3d',
				'href':'/models3d/',
				'title':_('Models3d'),
				'label':'models3d',
				'classes':'',
				'disabled':False},

				{'name':'textures',
				'href':'/textures/',
				'title':_('Textures'),
				'label':'textures',
				'classes':'',
				'disabled':True},

				{'name':'audio',
				'href':'/audio/',
				'title':_('Audio'),
				'label':'audio',
				'classes':'',
				'disabled':True},

				{'name':'shaders',
				'href':'/shaders/',
				'title':_('Shaders'),
				'label':'shaders',
				'classes':'',
				'disabled':True},

				{'name':'hdri',
				'href':'/hdri/',
				'title':_('HDRI'),
				'label':'hdri',
				'classes':'',
				'disabled':True},]

	context['menu_items'] = items
	return context