from django.contrib import admin
from django.conf.urls.defaults import *
from django.conf import settings
from signals_ahoy.signals import collect_urls


admin.autodiscover()

urlpatterns = patterns('',
    # local app urls here

    url(r'^iewarning/$', 'extra.views.ie_warning', name='ie-warning'),
    url(r'^maintance/$', 'extra.views.maintance', name='cgswapcom-maintance'),

    #(r'^u/', include('shop.urls')),
    url(r'^profile/', include('uprofile.urls')),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^$', 'extra.views.maintance', name='index'),
)

#if settings.DEBUG:
urlpatterns += patterns('',
  (r'^static/(?P<path>.*)$', 'django.views.static.serve',
    {'document_root': settings.MEDIA_ROOT}),
)
