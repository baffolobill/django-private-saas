### dev settings ###

from cgswap_com.conf.settings import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ROOT_URLCONF = 'cgswap_com.conf.dev.urls'

# DATABASE_ENGINE = 'postgresql_psycopg2'
# DATABASE_NAME = 'cgswap_com'
# DATABASE_USER = 'dbuser'
# DATABASE_PASSWORD = 'dbpassword'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'baffolobillcom_db',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': '/opt/local/var/run/mysql5/mysqld.sock',
        'PORT': '3306',
    }
}
