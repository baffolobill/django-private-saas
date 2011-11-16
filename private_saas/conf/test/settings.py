from cgswap_com.conf.settings import *

DEBUG=False
TEMPLATE_DEBUG=False

# Database connection info.
DATABASE_ENGINE = 'sqlite3'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME = ':memory:'            # Or path to database file if using sqlite3.

ROOT_URLCONF = 'cgswap_com.conf.test.urls'

INSTALLED_APPS += ('django_nose', )

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
