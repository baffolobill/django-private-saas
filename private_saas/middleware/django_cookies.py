"""
- Thanks for a snippet (http://www.davidcramer.net/code/62/set-cookies-without-a-response-in-django.html),
- but I had trouble with original version because of 'csrf_token' && lazy function. This is why I'm obliged
- to make changes and remove almost all flavor of the original code.
- (Alexander Volkov baffolobill[at]yandex[dot].ru)

A two-part middleware which modifies request.COOKIES and adds a set and delete method.

    `set` matches django.http.HttpResponse.set_cookie
    `delete` matches django.http.HttpResponse.delete_cookie

MIDDLEWARE_CLASSES = (
    'django_cookies.CookiePreHandlerMiddleware',
    ...
    'django_cookies.CookiePostHandlerMiddleware',
)

def my_view(request):
    request.COOKIES.set([args])
    ...
    return response
"""

import copy
 
class CookiePreHandlerMiddleware(object):
    """
    This middleware modifies request.COOKIES and adds a set and delete method.
 
    `set` matches django.http.HttpResponse.set_cookie
    `delete` matches django.http.HttpResponse.delete_cookie
 
    This should be the first middleware you load.
    """
    def process_request(self, request):
        request._orig_cookies = copy.deepcopy(request.COOKIES)
 
class CookiePostHandlerMiddleware(object):
    """
    This middleware modifies updates the response will all modified cookies.
 
    This should be the last middleware you load.
    """
    def process_response(self, request, response):
        if hasattr(request, '_orig_cookies') and request.COOKIES != request._orig_cookies:
            for k,v in request.COOKIES.iteritems():
                if request._orig_cookies.get(k) != v:
                    response.set_cookie(k, v, path='/')
        return response

