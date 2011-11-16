from django.conf.urls.defaults import *
from django.conf import settings

import extra.views

urlpatterns = patterns('',
    # local app urls here
    (r'^$', extra.views.default),


    # main menu
)

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve',
         {'document_root': settings.MEDIA_ROOT}),
    )
