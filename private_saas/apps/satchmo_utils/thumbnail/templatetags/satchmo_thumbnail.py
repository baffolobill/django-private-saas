""" image related filters """

##################################################
## DEPENDENCIES ##

from django import template
from django.conf import settings
from django.template import TemplateSyntaxError
from satchmo_utils.thumbnail.utils import make_thumbnail, get_image_size
register = template.Library()
##################################################
## FILTERS ##

def thumbnail(url, args=''):
    """ Returns thumbnail URL and create it if not already exists.

.. note:: requires PIL_,
    if PIL_ is not found or thumbnail can not be created returns original URL.

.. _PIL: http://www.pythonware.com/products/pil/

Usage::

    {{ url|thumbnail:"width=10,height=20" }}
    {{ url|thumbnail:"width=10" }}
    {{ url|thumbnail:"height=20" }}

Parameters:

width
    requested image width

height
    requested image height

Image is **proportionally** resized to dimension which is no greather than ``width x height``.

Thumbnail file is saved in the same location as the original image
and his name is constructed like this::

    %(dirname)s/%(basename)s_t[_w%(width)d][_h%(height)d].%(extension)s

or if only a width is requested (to be compatibile with admin interface)::

    %(dirname)s/%(basename)s_t%(width)d.%(extension)s

"""
    
    kwargs = {}
    if args:
        if ',' not in args:
            # ensure at least one ','
            args += ','
        for arg in args.split(','):
            arg = arg.strip()
            if arg == '': continue
            kw, val = arg.split('=', 1)
            kw = kw.lower().encode('ascii')
            try:
                val = int(val) # convert all ints
            except ValueError:
                raise template.TemplateSyntaxError, "thumbnail filter: argument %r is invalid integer (%r)" % (kw, val)
            kwargs[kw] = val
    
    if ('width' not in kwargs) and ('height' not in kwargs):
        raise template.TemplateSyntaxError, "thumbnail filter requires arguments (width and/or height)"
    
    ret = make_thumbnail(url, **kwargs)
    if ret is None:
        ret = url

    if not ret.startswith(settings.MEDIA_URL):
        ret = settings.MEDIA_URL + ret

    return ret
   
#
register.filter('thumbnail', thumbnail)

def image_width(url):
    """ Returns image width.

Usage:
    {{ url|image_width }}
"""
    
    width, height = get_image_size(url)
    return width
#

register.filter('image_width', image_width)

def image_height(url):
    """ Returns image height.

Usage:
    {{ url|image_width }}
"""
    
    width, height = get_image_size(url)
    return height
#

register.filter('image_height', image_height)
