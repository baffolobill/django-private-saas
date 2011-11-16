import datetime
from django import http, shortcuts
from django.conf import settings
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.shortcuts import redirect
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils import simplejson
from django.utils.translation import ugettext_lazy as _
from django.utils.http import base36_to_int
#from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect

from subscription.models import Promocode, Subscription, UserSubscription, Transaction
from invitation.forms import RegistrationFormInvitation

from .forms import PasswordResetForm, SetPasswordForm, PasswordChangeForm
from .models import Feedback

class JSONResponse(http.HttpResponse):
    def __init__(self, data, **kwargs):
        defaults = {
          'content_type': 'application/json',
        }
        defaults.update(kwargs)
        super(JSONResponse, self).__init__(simplejson.dumps(data), defaults)

def _error(msg):
    return JSONResponse({'success':0, 'error':unicode(msg)})


def _subscribe_user(user):
    us, created = UserSubscription.objects.get_or_create(user=user)
    if created:
        us.expires = datetime.datetime.now() + \
            datetime.timedelta(settings.SUBSCRIPTION_TRIAL_PERIOD)
        us.save()
        Transaction(user=user, event='Trial period', \
                    period=settings.SUBSCRIPTION_TRIAL_PERIOD
                    ).save()
    return

def profile__register(request):
    if not request.POST:
        return _error(_('Required POST method.'))

    form = RegistrationFormInvitation(request.POST, request.FILES)
    if form.is_valid():
        new_user = form.save(profile_callback=_subscribe_user)

        if new_user:
            new_user_auth = authenticate(username=request.POST['username'],
                                        password=request.POST['password1'])
            auth_login(request, new_user_auth)
            return JSONResponse({'success':1, 'message':unicode(_('Success')), 'redirect_to':reverse('profile-index')})
        else:
            return _error(_('Cannot log in new user.'))
    else:
        form_err = [(k,v[0]) for k, v in form.errors.items()]
        return JSONResponse({'success':0, 'form_errors':form_err})


def profile__login(request):
    if not request.POST:
        return JSONResponse({'success':0, 'error':unicode(_('Form method have to POST.'))})

    if not ('signin__username' in request.POST and 'signin__password' in request.POST):
        return JSONResponse({'success':1, 'error':unicode(_('You forgot enter login/password.'))})

    username = request.POST['signin__username']
    password = request.POST['signin__password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            auth_login(request, user)
            return JSONResponse({'success':1, 'message':unicode(_('Success')), 'redirect_to':reverse('profile-index')})
        else:
            return JSONResponse({'success':1, 'error':unicode(_('Account is disabled. Please contact with admins.'))})
    else:
        return JSONResponse({'success':1, 'error':unicode(_('Bad login/password.'))})

def profile__reset_password(request,
                            password_reset_form=PasswordResetForm,
                            token_generator=default_token_generator,
                            email_template_name='uprofile/registration/password_reset_email.txt',
                            subject_template_name='uprofile/registration/password_reset_subject.txt',
                            from_email=None):
    if not request.POST:
        return JSONResponse({'success':0, 'error':unicode(_('Form method have to be POST.'))})

    if not request.POST.has_key('username'):
        return JSONResponse({'success':0, 'error':unicode(_('You forgot give me an username.'))})


    form = password_reset_form(request.POST)
    if form.is_valid():
        opts = {
            'use_https': request.is_secure(),
            'token_generator': token_generator,
            'from_email': from_email,
            'email_template_name': email_template_name,
            'subject_template_name': subject_template_name,
            'request': request,
        }
        try:
            form.save(**opts)
        except Exception, why:
            return JSONResponse({'success':0, 'error':unicode(_('Cannot send email, some server side problems. Try again letter.'))})
        return JSONResponse({'success':1, 'message':unicode(_('Check your email.'))})
    else:
        form_err = [(k,v[0]) for k, v in form.errors.items()]
        return JSONResponse({'success':0, 'form_errors':form_err})



# Doesn't need csrf_protect since no-one can guess the URL
#@sensitive_post_parameters()
#@never_cache
def password_reset_confirm(request, uidb36=None, token=None,
                           template_name='uprofile/registration/password_reset_confirm.html',
                           token_generator=default_token_generator,
                           set_password_form=SetPasswordForm,
                           current_app=None, extra_context=None):

    assert uidb36 is not None and token is not None # checked by URLconf

    try:
        uid_int = base36_to_int(uidb36)
        user = User.objects.get(id=uid_int)
    except (ValueError, User.DoesNotExist):
        user = None

    if user is not None and token_generator.check_token(user, token):
        validlink = True
        if request.method == 'POST':
            form = set_password_form(user, request.POST)
            if form.is_valid():
                form.save()
                user_auth = authenticate(username=user.username,
                                        password=request.POST['new_password1'])
                auth_login(request, user_auth)
                return redirect('profile-index')
        else:
            form = set_password_form(None)
    else:
        validlink = False
        form = None
    context = {
        'form': form,
        'validlink': validlink,
    }
    if extra_context is not None:
        context.update(extra_context)
    return shortcuts.render_to_response(template_name, RequestContext(request, context))

#@sensitive_post_parameters()
@csrf_protect
@login_required
def password_change(request,
                    template_name='registration/password_change_form.html',
                    password_change_form=PasswordChangeForm):

    if request.method == "POST":
        form = password_change_form(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            return JSONResponse({'success':1, 'message':unicode(_('Password has been changed.'))})
        else:
            form_err = [(k,v[0]) for k, v in form.errors.items()]
            return JSONResponse({'success':0, 'form_errors':form_err})

    return JSONResponse({'success':0, 'error':unicode(_('Require POST method form.'))})



@login_required
def profile__logout(request):
    auth_logout(request)
    return redirect('/')

@login_required
def profile__index(request, tmpl='uprofile/index.html'):
    ctx = RequestContext(request, {'user':request.user,
                                    'password_change_form':PasswordChangeForm(user=request.user)})

    return shortcuts.render_to_response(tmpl, ctx)


@login_required
def profile__payment__payform(request):
    if not request.POST:
        return JSONResponse({'success':0, 'error':unicode(_('Require POST method form.'))})

    if not request.POST.has_key('payment__period'):
        return JSONResponse({'success':0, 'error':unicode(_('You forgot choose payment period.'))})

    payment_period = request.POST['payment__period']
    try:
        pp = Subscription.objects.get(id=payment_period)
    except Subscription.DoesNotExist:
        return JSONResponse({'success':0, 'error':unicode(_('Invalid payment period.'))})

    html = render_to_string('subscription/a1pay_form.html',
            RequestContext(request, {'price':float(pp.price)*40.0,
                                    'name':'Extend subscription on %s'%pp.name,
                                    'email':request.user.email,
                                    'order_id':0}))

    return JSONResponse({'success':1, 'html':html})

def profile__payment__success(request):
    pass

def profile__payment__fail(request):
    pass

@login_required
def profile__payment__promocode(request):
    if not request.POST:
        return JSONResponse({'success':0, 'error':unicode(_('Require POST method form.'))})

    if not request.POST.has_key('payment__promocode'):
        return JSONResponse({'success':0, 'error':unicode(_('You forgot enter promocode.'))})

    promocode = unicode(request.POST['payment__promocode']).strip()
    if len(promocode) == 0:
        return JSONResponse({'success':0, 'error':unicode(_('Empty promocode is not allowed.'))})

    try:
        pc = Promocode.objects.get(key=promocode)
    except Promocode.DoesNotExist:
        return JSONResponse({'success':0, 'error':unicode(_('Invalid promocode.'))})

    if not pc.valid():
        return JSONResponse({'success':0, 'error':unicode(_('Promocode is expired.'))})

    success, msg = pc.activate(request.user)
    if not success:
        return JSONResponse({'success':0, 'error':unicode(msg)})

    return JSONResponse({'success':1, 'message':unicode(msg)})


@login_required
def profile__history(request):
    pass


@login_required
def profile__feedback(request):
    if not request.POST:
        return JSONResponse({'success':0, 'error':unicode(_('Require POST method form.'))})

    if not request.POST.has_key('fb__message'):
        return JSONResponse({'success':0, 'error':unicode(_('You forgot enter a message.'))})

    msg = unicode(request.POST['fb__message']).strip()
    if len(msg) == 0:
        return JSONResponse({'success':0, 'error':unicode(_('Thanks for an empty message.'))})

    if len(Feedback.objects.filter(user=request.user, message=msg)) > 0:
        return JSONResponse({'success':0,
                'error':unicode(_('You already receive this message from you, please wait a response.'))})

    try:
        fb = Feedback.objects.create(user=request.user, message=msg)
    except Exception, why:
        return JSONResponse({'success':0, 'error':unicode(_('Cannot save your message, try again letter.'))})

    return JSONResponse({'success':1, 'message':unicode(_('Thanks for message.'))})


