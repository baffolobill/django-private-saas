from django import template
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

register = template.Library()

@register.inclusion_tag('uprofile/layouts/menu/menu.html', takes_context=True)
def cp_menu(context):
	block_id = lambda x: "#profile__%s" % x
	default_onclick = lambda x: "return show_block('profile__%s');" % x
	items = [
		{'label':_('Me'),
		'url': block_id('me'), #reverse('profile-index'),
		'onclick': default_onclick('me'),
		'classes': '',
		'disabled': False,
		'items': [
			{'label': _('Account'),
			'url': block_id('me'), #reverse('profile-index'),
			'onclick': default_onclick('me'),
			'classes': '',
			'disabled': False},

			{'label': _('Sign out'),
			'url': reverse('profile-logout'),
			'classes': '',
			'disabled': False},
			]
		},

		{'label':_('Payments'),
		'url': block_id('payments'), #reverse('profile-payment-index'),
		'onclick': default_onclick('payments'),
		'classes': '',
		'disabled': False,
		'items': [
			{'label': _('Pay'),
			'url': block_id('payments'), #reverse('profile-payment-index'),
			'onclick': default_onclick('payments'),
			'classes': '',
			'disabled': False},

			{'label': _('Promo Code'),
			'url': block_id('payments__promocode'), #reverse('profile-payment-promocode'),
			'onclick': default_onclick('payments__promocode'),
			'classes': '',
			'disabled': False},

			{'label': _('History'),
			'url': block_id('payments__history'), #reverse('profile-payment-history'),
			'onclick': default_onclick('payments__history'),
			'classes': '',
			'disabled': False},
			]
		},

		{'label':_('History'),
		'url': block_id('history'), #reverse('profile-history-index'),
		'onclick': default_onclick('history'),
		'classes': '',
		'disabled': False,
		'items': [
			{'label': _('Models3d'),
			'url': block_id('history'), #reverse('profile-history-index'),
			'onclick': default_onclick('history'),
			'classes': '',
			'disabled': False},

			{'label': _('Textures'),
			'url': block_id('history'), #reverse('profile-history-index'),
			'onclick': default_onclick('history'),
			'classes': '',
			'disabled': False},

			{'label': _('HDRI'),
			'url': block_id('history'), #reverse('profile-history-index'),
			'onclick': default_onclick('history'),
			'classes': '',
			'disabled': False},
			]
		},

		{'label':_('Feedback'),
		'url': block_id('feedback'), #reverse('profile-feedback-index'),
		'onclick': default_onclick('feedback'),
		'classes': '',
		'disabled': False,
		'items': []
		},

	]
	context['menu'] = items

	return context
