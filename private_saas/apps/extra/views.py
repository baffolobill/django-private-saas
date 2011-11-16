from django import http, shortcuts
from django.conf import settings
from django.core.urlresolvers import reverse
from django.shortcuts import redirect
from django.utils import simplejson
from django.template import RequestContext

def feedback(request):
    return shortcuts.render_to_response('feedback.html')

def maintance(request, tmpl='maintance.html'):
    from invitation.forms import RegistrationFormInvitation
    reg_form = RegistrationFormInvitation()
    return shortcuts.render_to_response(tmpl, \
            context_instance=RequestContext(request, {'reg_form':reg_form}))

def ie_warning(request):
    return shortcuts.render_to_response('ie_warning.html', context_instance=RequestContext(request))

def default(request):
    #from django.template import RequestContext
    #from django.shortcuts import render_to_response as _render_to_response
    #context = RequestContext(request, {'mainmenu':{'active':'evideo'}})
    #return _render_to_response('index.html', context_instance=context)
    return render_to_response(request, 'index.html', {'mainmenu':{'active':'evideo'}})

def get_object_or_404(model, **kwargs):
    from django.shortcuts import get_object_or_404 as _get_object_or_404
    if 'published' not in kwargs:
        kwargs['published'] = True
    return _get_object_or_404(model, **kwargs)

def get_object_or_none(klass, *args, **kwargs):
    try:
        return klass._default_manager.get(*args, **kwargs)
    except klass.DoesNotExist:
        return None

def render_to_response(request, template_name, context_dict, **kwargs):
    from django.template import RequestContext
    from django.shortcuts import render_to_response as _render_to_response

    # dev restrict permission
    if settings.DEVELOPMENT:
        if not request.user.is_authenticated():
            return redirect('cgswapcom-dev-auth')

        if not request.user.is_superuser:
            app_label = template_name[:template_name.find('/')]
            if len(request.user.groups.filter(name=app_label))==0:
                return redirect('cgswapcom-dev-403')

    # little dev hack
    #enabled = context_dict.get('enabled', [])
    #hidden_blocks = context_dict.get('hidden_blocks', [])
    #if type(enabled) == tuple:
    #    enabled = [e for e in enabled]
    #
    #if not request.user.is_authenticated:
    #    if 'shopping-cart' not in enabled \
    #           and 'shopping-cart' not in hidden_blocks:
    #        enabled.append('shopping-cart')
    #
    #context_dict['enabled'] = enabled

    context = RequestContext(request, context_dict)
    return _render_to_response(template_name, context_instance=context, **kwargs)

class JSONResponse(http.HttpResponse):
    def __init__(self, data, **kwargs):
        defaults = {
          'content_type': 'application/json',
        }
        defaults.update(kwargs)
        super(JSONResponse, self).__init__(simplejson.dumps(data), defaults)


def dev_auth(request):
    from django.template import RequestContext
    from django.contrib.auth import authenticate, login
    from django.shortcuts import render_to_response as _render_to_response

    msg = "This section under construction. If you have Dev Account, use form below to Sign In."

    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return http.HttpResponseRedirect(request.POST.get('redirect_to',
                                                                  reverse('baffolobillcom-models3d-default')))
            else:
                msg = "Account was disabled. Please contact with admins."
        else:
            msg = "Bad username/password. Try again."
    else:
        username = ''

    redirect_to = request.META.get('HTTP_REFERER', reverse('baffolobillcom-models3d-default'))
    return _render_to_response('dev/auth.html',
                               context_instance=RequestContext(request,{'msg':msg,
                                                                        'username':username,
                                                                        'redirect_to':redirect_to}))

def dev_403(request):
    from django.shortcuts import render_to_response as _render_to_response
    from django.template import RequestContext
    return _render_to_response('dev/403.html',
                               context_instance=RequestContext(request,{'enabled':('usernav',)}))
