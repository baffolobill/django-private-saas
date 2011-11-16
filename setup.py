#!/usr/bin/env python
from setuptools import setup, find_packages

setup(name='cgswap_com',
      version='0.1',
      packages=find_packages(),
      package_data={'cgswap_com': ['bin/*.*', 'static/*.*', 'templates/*.*']},
      exclude_package_data={'cgswap_com': ['bin/*.pyc']},
      scripts=['cgswap_com/bin/manage.py'])
