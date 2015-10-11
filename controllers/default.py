# -*- coding: utf-8 -*-
import json
from gluon.tools import prettydate
import gluon.http
import random


def show():
    if request.vars.search:
        search = request.vars.search
    return locals()



def index():
    return locals()




def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/manage_users (requires membership in
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    # the below from https://groups.google.com/forum/#!topic/web2py/okakKiDajNw
    if request.args[0]=='profile':
        response.view='default/profile.html'
        quotes_added = db((db.QUOTE.created_by==auth.user_id) &
            (db.QUOTE._id==db.QUOTE_WORK.QuoteID) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.WORK._id==db.WORK_TR.WorkID) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(db.QUOTE.Text,
            db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName, db.QUOTE.created_on)
        authors_added = db((db.AUTHOR_TR.created_by==auth.user_id) &
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(
            db.AUTHOR_TR.DisplayName, db.AUTHOR_TR.created_on,
            db.AUTHOR.YearBorn, db.AUTHOR.YearDied)
        works_added = db((db.WORK_TR.created_by==auth.user_id) &
            (db.WORK._id==db.WORK_TR.WorkID) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(
            db.WORK_TR.WorkName, db.WORK.YearPublished,
            db.AUTHOR_TR.DisplayName, db.WORK_TR.created_on)
        quotes_edited = db((db.QUOTE.modified_by==auth.user_id) &
            (db.QUOTE.modified_on!=db.QUOTE.created_on) & # not the first edit
            (db.QUOTE._id==db.QUOTE_WORK.QuoteID) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.WORK._id==db.WORK_TR.WorkID) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(db.QUOTE.Text,
            db.QUOTE.modified_on, db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName)
        return dict(form=auth(), quotes_added=quotes_added,
            authors_added=authors_added,
            works_added=works_added, quotes_edited=quotes_edited)
    return dict(form=auth())



@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


#@auth.requires_signature()
def data():
    """
    http://..../[app]/default/data/tables
    http://..../[app]/default/data/create/[table]
    http://..../[app]/default/data/read/[table]/[id]
    http://..../[app]/default/data/update/[table]/[id]
    http://..../[app]/default/data/delete/[table]/[id]
    http://..../[app]/default/data/select/[table]
    http://..../[app]/default/data/search/[table]
    but URLs must be signed, i.e. linked with
      A('table',_href=URL('data/tables',user_signature=True))
    or with the signed load operator
      LOAD('default','data.load',args='tables',ajax=True,user_signature=True)
    """
    return dict(form=crud())


# show user profile page
@auth.requires_login()
def users():
    user = db.auth_user(username=request.args(0)) or redirect(URL('error'))
    userid = user.id
    if userid == auth.user.id:
        redirect(URL('/user', args=('profile')))
    quotes_added = db((db.QUOTE.created_by==userid) &
      (db.QUOTE._id==db.QUOTE_WORK.QuoteID) &
        (db.QUOTE_WORK.WorkID==db.WORK._id) &
        (db.WORK._id==db.WORK_TR.WorkID) &
        (db.WORK_AUTHOR.WorkID==db.WORK._id) &
        (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
        (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(db.QUOTE.Text,
        db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName, db.QUOTE.created_on)
    authors_added = db((db.AUTHOR_TR.created_by==userid) &
        (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(db.AUTHOR_TR.DisplayName,
        db.AUTHOR_TR.created_on, db.AUTHOR.YearBorn, db.AUTHOR.YearDied)

    works_added = db((db.WORK_TR.created_by==userid) &
        (db.WORK._id==db.WORK_TR.WorkID) &
        (db.WORK_AUTHOR.WorkID==db.WORK._id) &
        (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
        (db.AUTHOR._id==db.AUTHOR_TR.AuthorID) &
        (db.WORK_TR.WorkName != 'Attributed')).select(db.WORK_TR.WorkName,
        db.WORK.YearPublished, db.AUTHOR_TR.DisplayName, db.WORK_TR.created_on)

    quotes_edited = db((db.QUOTE.modified_by==userid) &
        (db.QUOTE.modified_on!=db.QUOTE.created_on) & # not the first edit
        (db.QUOTE._id==db.QUOTE_WORK.QuoteID) &
        (db.QUOTE_WORK.WorkID==db.WORK._id) &
        (db.WORK._id==db.WORK_TR.WorkID) &
        (db.WORK_AUTHOR.WorkID==db.WORK._id) &
        (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
        (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)).select(db.QUOTE.Text,
        db.QUOTE.modified_on, db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName)
    return dict(user=user, quotes_added=quotes_added,
            authors_added=authors_added,
            works_added=works_added, quotes_edited=quotes_edited)


# show the page for a quote
def quotes():
    # figure out what quote to display
    q = db.QUOTE(request.args(0))
    # if quote is invalid, return to home
    if not q:
        redirect(URL('default', 'show'))
    if auth.user:
        lang = auth.user.PrimaryLanguageID
    else:
        lang = 1  # default is english
    # get comments
    comment_count = db((db.COMMENT.QuoteID==request.args(0))).count()
    # get avg and count of ratings
    rating_query = db(db.RATING.QuoteID==request.args(0))
    sum_ratings = rating_query.select(
        db.RATING.Rating.avg(), db.RATING.Rating.count()).first()
    rating = sum_ratings._extra['AVG(RATING.Rating)']
    rating_count = sum_ratings._extra['COUNT(RATING.Rating)']
    # if user, note what user's rating is
    if auth.user:
        try:
            rating_user = rating_query(db.RATING.created_by==auth.user).select(
                db.RATING.Rating).first().Rating
        except:
            rating_user = 0
    else:
        rating_user = 0
    # select quote information
    q = db((db.QUOTE._id==request.args(0)) &
            (db.QUOTE._id==db.QUOTE_WORK.QuoteID) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.WORK._id==db.WORK_TR.WorkID) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR_TR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR_TR.LanguageID==lang) &
            (db.WORK_TR.LanguageID==lang) &
            (db.QUOTE.created_by==db.auth_user.id)).select(
            db.QUOTE.ALL, db.WORK_TR.WorkName,
            db.AUTHOR_TR.DisplayName, db.WORK_TR._id, db.AUTHOR_TR._id,
            db.auth_user.username).first()
    langs = db((db.LANGUAGE._id > 0)).select(
        db.LANGUAGE.NativeName, db.LANGUAGE._id,
        orderby=db.LANGUAGE._id).as_list()
    # if user clicked on flag or comments to get to this page, show them
    if request.vars.flagType:
        request_flag_type = request.vars.flagType
    if request.vars.comments:
        request_comments = request.vars.comments
    return locals()


# unique page for each author
def authors():
    if auth.user:
        lang = auth.user.PrimaryLanguageID
    else:
        lang = 1  # default is english

    # get author id
    if request.args(0)=='all':
        if request.vars['e']:
            response.flash='Author ' + request.vars['e'] + ' was not found'
        if request.vars.search:
            search = request.vars.search
        return locals()
    a = db.AUTHOR_TR(request.args(0))

    # if author is invalid, show all authors and an error message
    if not a:
        if not request.args(0):
            redirect(URL('Pindar/default', 'authors', 'all'))
        else:
            redirect(URL('Pindar/default', 'authors', 'all?e='+request.args(0)))

    # get author data
    try:
        author = db((db.AUTHOR_TR._id==request.args(0)) &
            (db.AUTHOR_TR.AuthorID==db.AUTHOR._id)).select()
        author_id = author[0]['AUTHOR']['id']
    except KeyError:
        redirect(URL('authors', 'all?e='+request.args(0)))

    # get quote count, ratings, works, and quotes associated with the author
    quotecount = db.QUOTE_WORK.QuoteID.count()

    ratings = db((db.WORK_AUTHOR.AuthorID==author_id) &
        (db.QUOTE_WORK.WorkID==db.WORK_AUTHOR.WorkID)).select(
        db.RATING.Rating.avg(), db.RATING.Rating.count(),
        left=db.RATING.on(db.RATING.QuoteID==db.QUOTE_WORK.QuoteID),
        groupby=db.WORK_AUTHOR.AuthorID)

    works = db((db.WORK_AUTHOR.AuthorID==author_id) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK._id==db.WORK_TR.WorkID) &
            (db.WORK_TR.LanguageID==lang)).select(
            db.WORK.YearPublished, db.WORK.YearWritten, db.WORK.id,
            db.WORK_TR.id, db.WORK_TR.WorkName, db.WORK_TR.WorkSubtitle,
            quotecount,
            left=db.QUOTE_WORK.on(db.WORK.id==db.QUOTE_WORK.WorkID),
            groupby=db.WORK.id, orderby=~quotecount|db.WORK_TR.WorkName,
            limitby=(0,10))

    quotes = db((db.WORK_AUTHOR.AuthorID==author_id) &
            (db.WORK_AUTHOR.WorkID==db.WORK._id) &
            (db.WORK_TR.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.QuoteID==db.QUOTE._id) &
            (db.QUOTE.QuoteLanguageID==lang)).select(
            orderby=~db.QUOTE.created_on, limitby=(0,10))

    return locals()


# unique page for each work
def works():
    if auth.user:
        lang = auth.user.PrimaryLanguageID
    else:
        lang = 1  # default is english# what work?
    if request.args(0)=='all':
        if request.vars['e']:
            response.flash='Work ' + request.vars['e'] + ' was not found'
        if request.vars.search:
            search = request.vars.search
        return locals()
    w = db.WORK_TR(request.args(0))
    # if work is invalid, show all works and an error message
    if not w:
        if not request.args(0):
            redirect(URL('Pindar/default', 'works', 'all'))
        else:
            redirect(URL('Pindar/default', 'works', 'all?e='+request.args(0)))
    try:
        work = db((db.WORK_TR._id==request.args(0)) &
            (db.WORK_TR.WorkID==db.WORK._id) &
            (db.WORK_TR.LanguageID==lang)).select(
            db.WORK.ALL, db.WORK_TR.ALL, groupby=db.WORK._id)
        work_id = work[0]['WORK_TR']['id']
    except KeyError:
        redirect(URL('Pindar/default', 'works', 'all?e='+request.args(0)))
    ratings = db(db.QUOTE_WORK.WorkID==work_id).select(
            db.RATING.Rating.avg(), db.RATING.Rating.count(),
            left=db.RATING.on(db.RATING.QuoteID==db.QUOTE_WORK.QuoteID),
            groupby=db.QUOTE_WORK.WorkID)
    authors = db((db.WORK_AUTHOR.WorkID==work_id) &
            (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) &
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID) &
            (db.AUTHOR_TR.LanguageID==lang)).select(
            orderby=db.AUTHOR_TR.DisplayName, limitby=(0,10))
    quotes = db((db.WORK_TR._id==work_id) &
            (db.WORK_TR.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.QuoteID==db.QUOTE._id)).select(
            orderby=~db.QUOTE.created_on, limitby=(0,10))
    return locals()


@auth.requires_login()
def add():
    langs = db((db.LANGUAGE._id > 0)).select(
        db.LANGUAGE.NativeName, db.LANGUAGE._id,
        orderby=db.LANGUAGE._id).as_list()
    if request.vars.author:
        init_author_query = db((db.AUTHOR_TR.id==request.vars.author) &
            (db.AUTHOR_TR.AuthorID==db.AUTHOR.id)).select(
            db.AUTHOR_TR.DisplayName, db.AUTHOR.id, limitby=(0,1))[0]
        init_author = init_author_query.AUTHOR.id
        init_author_name = init_author_query.AUTHOR_TR.DisplayName
    if request.vars.work:
        init_work_query = db((db.WORK_TR.id==request.vars.work) &
            (db.WORK_TR.WorkID==db.WORK.id)).select(
            db.WORK_TR.WorkName, db.WORK.id, limitby=(0,1))[0]
        init_work = init_work_query.WORK.id
        init_work_name = init_work_query.WORK_TR.WorkName
        if not request.vars.author:
            search = db((db.WORK_AUTHOR.WorkID==init_work) &
                (db.AUTHOR.id==db.WORK_AUTHOR.AuthorID) &
                (db.AUTHOR_TR.AuthorID==db.AUTHOR.id)).select(
                db.AUTHOR_TR.DisplayName, db.AUTHOR.id,
                limitby=(0,1))[0]
            init_author = search.AUTHOR.id
            init_author_name = search.AUTHOR_TR.DisplayName
    return locals()












