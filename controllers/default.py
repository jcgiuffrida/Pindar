# -*- coding: utf-8 -*-
import json
from gluon.tools import prettydate
import gluon.http
import random
import collections


def show():
    if request.vars.search:
        search = request.vars.search
    session.rand=random.randint(1, 10)
    # this number should be proportionate to average hourly traffic
    # so that caching is effective but quotes are still fairly random
    if request.vars['e']:
        response.flash='Quote ' + request.vars['e'] + ' was not found'

    # make initial queries
    # get initial works search
    lang = 1
    quotecount = db.QUOTE_WORK.QuoteID.count()
    query = (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) & \
            (db.WORK_AUTHOR.WorkID==db.WORK._id) & \
            (db.WORK._id==db.WORK_TR.WorkID) & \
            (db.WORK_TR.LanguageID==lang) & \
            (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)
    init_query = db(query).select(
            db.WORK_TR.WorkName, db.WORK_TR.id,
            db.WORK_TR.WorkSubtitle, db.WORK.YearPublished,
            db.WORK.id, db.AUTHOR_TR.DisplayName,
            db.AUTHOR_TR.id, db.WORKTYPE.TypeName, quotecount,
            left=(db.QUOTE_WORK.on(db.WORK.id==db.QUOTE_WORK.WorkID),
                db.WORKTYPE.on(db.WORK.Type==db.WORKTYPE._id)),
            groupby=db.WORK.id, orderby=~quotecount)
    init_query = init_query.find(lambda row: row['_extra']['COUNT(QUOTE_WORK.QuoteID)'] > 0 or row.WORK_TR.WorkName != 'Attributed')
    init_query = init_query.find(lambda row: True,
        limitby=(0, 30))
    init_works = sanitize_JSON(init_query.as_list())

    # get initial author search
    lang = 1
    workcount = db.WORK_AUTHOR.WorkID.count()
    query = (db.AUTHOR_TR.LanguageID==lang) & (db.AUTHOR_TR.AuthorID==db.AUTHOR.id)
    init_query = db(query).select( db.AUTHOR_TR.DisplayName, db.AUTHOR_TR.id,
        db.AUTHOR.YearBorn, db.AUTHOR.YearDied, db.AUTHOR.id, workcount,
        left=db.WORK_AUTHOR.on(db.AUTHOR.id==db.WORK_AUTHOR.AuthorID),
        groupby=db.AUTHOR.id, orderby=~workcount, limitby=(0, 30))

    init_authors = sanitize_JSON(init_query.as_list())

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


@auth.requires_membership('overlord')
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
        redirect(URL('default', 'show?e='+request.args(0)))
    if auth.user and auth.user.PrimaryLanguageID is not None:
        lang = auth.user.PrimaryLanguageID
    else:
        lang = 1  # default is english
    # get comments
    comment_count = db((db.COMMENT.QuoteID==request.args(0))).count()
    # get connections
    connection_count = db((db.CONNECTION.Quote1==request.args(0)) | 
        (db.CONNECTION.Quote2==request.args(0))).count()
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
        
        # get initial author search
        lang = 1
        workcount = db.WORK_AUTHOR.WorkID.count()
        query = (db.AUTHOR_TR.LanguageID==lang) & (db.AUTHOR_TR.AuthorID==db.AUTHOR.id)
        init_query = db(query).select( db.AUTHOR_TR.DisplayName, db.AUTHOR_TR.id,
            db.AUTHOR.YearBorn, db.AUTHOR.YearDied, db.AUTHOR.id, workcount,
            left=db.WORK_AUTHOR.on(db.AUTHOR.id==db.WORK_AUTHOR.AuthorID),
            groupby=db.AUTHOR.id, orderby=~workcount, limitby=(0, 30))

        init_query = sanitize_JSON(init_query.as_list())

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

    authortypes = db((db.AUTHORTYPE._id > 0)).select(
        db.AUTHORTYPE._id, db.AUTHORTYPE.TypeName,
        orderby=db.AUTHORTYPE._id).as_list()

    return locals()


# unique page for each work
def works():
    if auth.user:
        lang = auth.user.PrimaryLanguageID
    else:
        lang = 1  # default is english
    # what work?
    if request.args(0)=='all':
        if request.vars['e']:
            response.flash='Work ' + request.vars['e'] + ' was not found'
        if request.vars.search:
            search = request.vars.search

        # get initial works search
        lang = 1
        quotecount = db.QUOTE_WORK.QuoteID.count()
        query = (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) & \
                (db.WORK_AUTHOR.WorkID==db.WORK._id) & \
                (db.WORK._id==db.WORK_TR.WorkID) & \
                (db.WORK_TR.LanguageID==lang) & \
                (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)
        init_query = db(query).select(
                db.WORK_TR.WorkName, db.WORK_TR.id,
                db.WORK_TR.WorkSubtitle, db.WORK.YearPublished,
                db.WORK.id, db.AUTHOR_TR.DisplayName,
                db.AUTHOR_TR.id, db.WORKTYPE.TypeName, quotecount,
                left=(db.QUOTE_WORK.on(db.WORK.id==db.QUOTE_WORK.WorkID),
                    db.WORKTYPE.on(db.WORK.Type==db.WORKTYPE._id)),
                groupby=db.WORK.id, orderby=~quotecount)
        init_query = init_query.find(lambda row: row['_extra']['COUNT(QUOTE_WORK.QuoteID)'] > 0 or row.WORK_TR.WorkName != 'Attributed')
        init_query = init_query.find(lambda row: True,
            limitby=(0, 30))
        init_query = sanitize_JSON(init_query.as_list())
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
        work_tr_id = work[0]['WORK_TR']['id']
        work_id = work[0]['WORK']['id']
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
    quotes = db((db.WORK_TR._id==work_tr_id) &
            (db.WORK_TR.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.WorkID==db.WORK._id) &
            (db.QUOTE_WORK.QuoteID==db.QUOTE._id)).select(
            orderby=~db.QUOTE.created_on, limitby=(0,10))
    worktypes = db((db.WORKTYPE._id > 0)).select(
        db.WORKTYPE._id, db.WORKTYPE.TypeName,
        orderby=db.WORKTYPE._id).as_list()
    return locals()


@auth.requires_login()
def add():
    langs = db((db.LANGUAGE._id > 0)).select(
        db.LANGUAGE.NativeName, db.LANGUAGE._id,
        orderby=db.LANGUAGE._id).as_list()
    authortypes = db((db.AUTHORTYPE._id > 0)).select(
        db.AUTHORTYPE._id, db.AUTHORTYPE.TypeName,
        orderby=db.AUTHORTYPE._id).as_list()
    worktypes = db((db.WORKTYPE._id > 0)).select(
        db.WORKTYPE._id, db.WORKTYPE.TypeName,
        orderby=db.WORKTYPE._id).as_list()
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
            search_author = db((db.WORK_AUTHOR.WorkID==init_work) &
                (db.AUTHOR.id==db.WORK_AUTHOR.AuthorID) &
                (db.AUTHOR_TR.AuthorID==db.AUTHOR.id)).select(
                db.AUTHOR_TR.DisplayName, db.AUTHOR.id,
                limitby=(0,1))[0]
            init_author = search_author.AUTHOR.id
            init_author_name = search_author.AUTHOR_TR.DisplayName
    return locals()

# page to show anthologies
def anthologies():
    # show multiple anthologies
    followcount = db.FOLLOW_ANTHOLOGY.AnthologyID.count()
    if request.args(0) == 'all' or request.args(0) == 'mine':
        query = (db.ANTHOLOGY._id > 0) & \
                (db.ANTHOLOGY.created_by==db.auth_user.id)
        if request.args(0) == 'mine':
            query &= (db.auth_user.id==auth.user)
        anths = db(query).select(
            db.ANTHOLOGY.ALL, db.auth_user.username, db.auth_user.id,
            followcount,
            left=db.FOLLOW_ANTHOLOGY.on(db.ANTHOLOGY._id==db.FOLLOW_ANTHOLOGY.AnthologyID),
            groupby=db.ANTHOLOGY._id,
            orderby=~followcount|~db.ANTHOLOGY.created_on,limitby=(0,10)
            ).as_list()
        if request.args(0) == 'mine':
            mine = True
        else:
            if request.vars['e']:
                response.flash='Sorry, anthology ' + request.vars['e'] + ' was not found'

        if len(anths) > 0:
            # return quotes in each anthology
            # db-heavy, but max 10 requests because of the limit on the previous
            #   query
            query = (db.QUOTE.id==db.SELECTION.QuoteID) & \
                    (db.QUOTE._id==db.QUOTE_WORK.QuoteID) & \
                    (db.QUOTE_WORK.WorkID==db.WORK._id) & \
                    (db.WORK._id==db.WORK_TR.WorkID) & \
                    (db.WORK_AUTHOR.WorkID==db.WORK._id) & \
                    (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) & \
                    (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)
            for a in anths:
                anthID = a['ANTHOLOGY']['id']
                q = query & (db.SELECTION.AnthologyID==anthID)
                quotes = db(q).select(
                        db.QUOTE.Text, db.QUOTE._id, db.SELECTION.AddedOn,
                        db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName,
                        orderby=~db.SELECTION.AddedOn).as_list()
                a['quotecount'] = len(quotes)
                # compile list of top authors
                authors = collections.Counter()
                for h in quotes:
                    h['SELECTION']['AddedOn'] = str(h['SELECTION']['AddedOn'])
                    if h['AUTHOR_TR']['DisplayName'] in authors:
                        authors[h['AUTHOR_TR']['DisplayName']] += 1
                    else:
                        authors[h['AUTHOR_TR']['DisplayName']] = 1
                if len(quotes) > 5:
                    a['quotes'] = quotes[0:5]
                else:
                    a['quotes'] = quotes
                a['top_authors'] = []
                if len(authors) > 5:
                    for i in authors.most_common()[0:5]:
                        a['top_authors'].append(i[0])
                else:
                    for i in authors.most_common():
                        a['top_authors'].append(i[0])

        if request.args(0) == 'mine':
            # add anthologies user is following
            query = (db.ANTHOLOGY._id > 0) & \
                    (db.ANTHOLOGY.created_by==db.auth_user.id) & \
                    (db.FOLLOW_ANTHOLOGY.AnthologyID==db.ANTHOLOGY.id) & \
                    (db.ANTHOLOGY.created_by!=auth.user) & \
                    (db.FOLLOW_ANTHOLOGY.UserID==auth.user)
            following_anths = db(query).select(
                db.ANTHOLOGY.ALL, db.auth_user.username, db.auth_user.id,
                followcount,
                left=db.FOLLOW_ANTHOLOGY.on(db.ANTHOLOGY._id==db.FOLLOW_ANTHOLOGY.AnthologyID),
                groupby=db.ANTHOLOGY._id,
                orderby=~followcount|~db.ANTHOLOGY.created_on,limitby=(0,10)
                ).as_list()

            if len(following_anths) > 0:
                # return quotes in each anthology
                query = (db.QUOTE.id==db.SELECTION.QuoteID) & \
                        (db.QUOTE._id==db.QUOTE_WORK.QuoteID) & \
                        (db.QUOTE_WORK.WorkID==db.WORK._id) & \
                        (db.WORK._id==db.WORK_TR.WorkID) & \
                        (db.WORK_AUTHOR.WorkID==db.WORK._id) & \
                        (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) & \
                        (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)
                for a in following_anths:
                    anthID = a['ANTHOLOGY']['id']
                    q = query & (db.SELECTION.AnthologyID==anthID)
                    quotes = db(q).select(
                            db.QUOTE.Text, db.QUOTE._id, db.SELECTION.AddedOn,
                            db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName,
                            orderby=~db.SELECTION.AddedOn).as_list()
                    a['quotecount'] = len(quotes)
                    # compile list of top authors
                    authors = collections.Counter()
                    for h in quotes:
                        h['SELECTION']['AddedOn'] = str(h['SELECTION']['AddedOn'])
                        if h['AUTHOR_TR']['DisplayName'] in authors:
                            authors[h['AUTHOR_TR']['DisplayName']] += 1
                        else:
                            authors[h['AUTHOR_TR']['DisplayName']] = 1
                    if len(quotes) > 5:
                        a['quotes'] = quotes[0:5]
                    else:
                        a['quotes'] = quotes
                    a['top_authors'] = []
                    if len(authors) > 5:
                        for i in authors.most_common()[0:5]:
                            a['top_authors'].append(i[0])
                    else:
                        for i in authors.most_common():
                            a['top_authors'].append(i[0])
        return locals()

    # if a specific anthology is requested, show it
    a = db.ANTHOLOGY(request.args(0))
    # if anthology is invalid, show all anthologies and an error message
    if not a:
        if not request.args(0):
            redirect(URL('default', 'anthologies/all'))
        else:
            redirect(URL('Pindar/default', 'anthologies', 'all?e='+request.args(0)))
    try:
        a = db((db.ANTHOLOGY._id==request.args(0)) &
            (db.ANTHOLOGY.created_by==db.auth_user.id)).select(
            db.ANTHOLOGY.ALL, db.auth_user.username, db.auth_user.id,
            followcount,
            left=db.FOLLOW_ANTHOLOGY.on(db.ANTHOLOGY._id==db.FOLLOW_ANTHOLOGY.AnthologyID),
            groupby=db.ANTHOLOGY._id, orderby=~followcount).as_list()[0]
        anthID = a['ANTHOLOGY']['id']
        # is user following anthology?
        if auth.user:
            userfollow = db((db.FOLLOW_ANTHOLOGY.AnthologyID==anthID) &
                            (db.FOLLOW_ANTHOLOGY.UserID==auth.user)).select(
                            db.FOLLOW_ANTHOLOGY.UserID)
            if len(userfollow) > 0:
                user_is_following = True

        # get quotes
        query = (db.QUOTE.id==db.SELECTION.QuoteID) & \
                    (db.QUOTE._id==db.QUOTE_WORK.QuoteID) & \
                    (db.QUOTE_WORK.WorkID==db.WORK._id) & \
                    (db.WORK._id==db.WORK_TR.WorkID) & \
                    (db.WORK_AUTHOR.WorkID==db.WORK._id) & \
                    (db.WORK_AUTHOR.AuthorID==db.AUTHOR._id) & \
                    (db.AUTHOR._id==db.AUTHOR_TR.AuthorID)
        q = query & (db.SELECTION.AnthologyID==anthID)
        quotes = db(q).select(
                db.QUOTE.Text, db.QUOTE._id, db.SELECTION.AddedOn,
                db.AUTHOR_TR.DisplayName, db.WORK_TR.WorkName,
                orderby=~db.SELECTION.AddedOn).as_list()
        a['quotecount'] = len(quotes)
        # compile list of top authors
        authors = collections.Counter()
        for h in quotes:
            h['SELECTION']['AddedOn'] = str(h['SELECTION']['AddedOn'])
            if h['AUTHOR_TR']['DisplayName'] in authors:
                authors[h['AUTHOR_TR']['DisplayName']] += 1
            else:
                authors[h['AUTHOR_TR']['DisplayName']] = 1
        a['quotes'] = quotes
        a['top_authors'] = []
        if len(authors) > 5:
            for i in authors.most_common()[0:5]:
                a['top_authors'].append(i[0])
        else:
            for i in authors.most_common():
                a['top_authors'].append(i[0])

    except IndexError:
        redirect(URL('Pindar/default', 'anthologies', 'all?e='+request.args(0)))
    except KeyError:
        redirect(URL('Pindar/default', 'anthologies', 'all?e='+request.args(0)))
    return locals()


# page to add anthologies
@auth.requires_login()
def add_anthology():
    if request.vars.quote:
        quote = request.vars.quote
    return locals()








