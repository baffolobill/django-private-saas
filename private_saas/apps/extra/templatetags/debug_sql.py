from django import template
from django.db import connection

register = template.Library()

@register.inclusion_tag('extra/sql.html', takes_context=False)
def sql_queries():
	q = connection.queries
	return {'sql_queries':q}
	