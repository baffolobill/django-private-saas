### global settings ###


# Import global settings to make it easier to extend settings.
from django.conf.global_settings import *
# Import the project module to calculate directories relative to the module
# location.
import os
import private_saas

PROJECT_ROOT, PROJECT_MODULE_NAME = os.path.split(
    os.path.dirname(os.path.realpath(private_saas.__file__))
)



DEVELOPMENT = False
DEBUG = True
TEMPLATE_DEBUG = DEBUG

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
ugettext = lambda s: s
LANGUAGE_CODE = 'en'
LANGUAGES = (
  ('en', ugettext('English')),
  ('ru', ugettext('Russian')),
)

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'static0')

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'static'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
    'compressor.finders.CompressorFinder',
)

ROOT_URLCONF = 'private_saas.conf.urls'

LOGIN_URL = '/'
LOGOUT_URL = '/profile/logout/'
LOGIN_REDIRECT_URL = '/'

REDIRECT_FIELD_NAME = 'redirect_to'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'ti^r!xuc4^mr07&2di=h0sberm4eadx4+jcub#!vwuslx!w3g9'



# Set locale path
LOCALE_PATHS = (
    os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'locale'),
)

TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'templates'),
)

TEMPLATE_CONTEXT_PROCESSORS += (
    'django.core.context_processors.request',
    'staticfiles.context_processors.static_url',
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'django.contrib.humanize',
    'django.contrib.staticfiles',
    'compressor',
    'sorl.thumbnail',
    'extra',
    'livesettings',
    'registration',
    'uprofile',
    'invitation',
    'captcha',
    'paypal.standard.ipn',
    'paypal.pro',
    'subscription',
)

MIDDLEWARE_CLASSES = (
#    'middleware.django_cookies.CookiePreHandlerMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'middleware.force_default_language_middleware.ForceDefaultLanguageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
#    'middleware.django_cookies.CookiePostHandlerMiddleware',
    'middleware.scripts_at_bottom_middleware.ScriptsAtBottomMiddleware',
    'threaded_multihost.middleware.ThreadLocalMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)


CACHE_BACKEND = 'memcached://127.0.0.1:11211/'
CACHE_TIMEOUT = 60*5
CACHE_PREFIX = "PRSS"


import logging
#Configure logging
LOGFILE = "private_saas.log"
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                    datefmt='%a, %d %b %Y %H:%M:%S')

#fileLog = logging.FileHandler(os.path.join(DIRNAME, LOGFILE), 'w')
#fileLog.setLevel(logging.DEBUG)
# add the handler to the root logger
#logging.getLogger('').addHandler(fileLog)
logging.getLogger('keyedcache').setLevel(logging.INFO)
logging.getLogger('l10n').setLevel(logging.INFO)
logging.info("Private SaaS Started")

EMAIL_NOREPLY = 'noreply@cgswap.com'


INVITATION_INVITE_ONLY = True
INVITATION_INITIAL_INVITATIONS = 5

SUBSCRIPTION_TRIAL_PERIOD = 3

CAPTCHA_IMAGES_PATH = os.path.join(STATICFILES_DIRS[0], 'captcha/')
CAPTCHA_IMAGES_URL = STATIC_URL + 'captcha/'
CAPTCHA_BASE_IMAGE = os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'apps/captcha/background/captcha_base.png')
CAPTCHA_FONT = os.path.join(PROJECT_ROOT, PROJECT_MODULE_NAME, 'apps/captcha/fonts/DejaVuSans.ttf')


PAYPAL_TEST = True           # Testing mode on
PAYPAL_RECEIVER_EMAIL = "baffol_1291489093_biz_api1.mail.ru"
PAYPAL_WPP_USER = "baffol_1291496082_biz_api1.mail.ru"      # Get from PayPal
PAYPAL_WPP_PASSWORD = "1291496098"
PAYPAL_WPP_SIGNATURE = "AuABy1Fzo7IoL6WLUit15sHFanUEAAOOefgmLfVF5zQ74KlsW2AmvJgN"

