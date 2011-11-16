from django.conf.urls.defaults import *

from uprofile import views

urlpatterns = patterns('',
    url(r'^$', views.profile__index, name='profile-index'),
    url(r'^login/$',  views.profile__login, name='profile-login'),
    url(r'^logout/$', views.profile__logout, name='profile-logout'),
    url(r'^register/$', views.profile__register, name='profile-register'),
    url(r'^reset/$',  views.profile__reset_password, name='profile-password-reset'),
    url(r'^reset/(?P<uidb36>[0-9A-Za-z]{1,13})-(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
          views.password_reset_confirm, name='password_reset_confirm'),
    #url(r'^reset/done/$', views.password_reset_complete, name='password_reset_complete'),
    url(r'^change-password/$', views.password_change, name='profile-change-password'),

    url(r'^payment/$', views.profile__payment__payform, name='profile-payment-index'),
    url(r'^payment/payform/$', views.profile__payment__payform, name='profile-payment-payform'),
    url(r'^payment/success/$', views.profile__payment__success, name='profile-payment-success'),
    url(r'^payment/fail/$', views.profile__payment__fail, name='profile-payment-fail'),

    url(r'^payment/promocode/$', views.profile__payment__promocode, name='profile-payment-promocode-form'),



    url(r'^history/$', views.profile__history, name='profile-history-index'),
    url(r'^feedback/$', views.profile__feedback, name='profile-feedback-form'),

    #url(r'^sub/', include('subscription.urls')),
)
