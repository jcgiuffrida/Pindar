# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## Customize your APP title, subtitle and menus here
#########################################################################

response.logo = A(B('Pindar'), _class="brand",
	_href="http://127.0.0.1:8000/Pindar/default/show")
response.title = request.application.replace('_',' ').title()
response.subtitle = 'open-source quotes'

## read more at http://dev.w3.org/html5/markup/meta.name.html
response.meta.author = 'jonny gee <me@jonnygee.org>'
response.meta.keywords = 'web2py, python, framework'
response.meta.generator = 'Web2py Web Framework'

## your http://google.com/analytics id
response.google_analytics_id = None

#########################################################################
## this is the main application menu add/remove items as required
#########################################################################

response.menu = []
response.usermenu = []

DEVELOPMENT_MENU = True

#########################################################################
## provide shortcuts for development. remove in production
#########################################################################

def _():
    # shortcuts
    app = request.application
    ctr = request.controller
    # useful links to internal and external resources


if DEVELOPMENT_MENU: _()

if "auth" in locals(): auth.wikimenu() 
