# -*- coding: utf-8 -*-

# controller for admin tools, letting administrators see, change, and delete the data


def quotes():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.QUOTE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('QUOTE', ids))])
    return locals()


def works():
    """
    *** for testing purposes only***
    """
    grid1 = SQLFORM.grid(db.WORK, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK', ids))])
    grid2 = SQLFORM.grid(db.WORK_TR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK_TR', ids))])
    return locals()



def authors():
    """
    *** for testing purposes only***
    """
    grid1 = SQLFORM.grid(db.AUTHOR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('AUTHOR', ids))])
    grid2 = SQLFORM.grid(db.AUTHOR_TR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('AUTHOR_TR', ids))])
    return locals()


def connections():
    """
    *** for testing purposes only***
    """
    grid1 = SQLFORM.grid(db.QUOTE_WORK, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('QUOTE_WORK', ids))])
    grid2 = SQLFORM.grid(db.WORK_AUTHOR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK_AUTHOR', ids))])
    return locals()


def languages():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.LANGUAGE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('LANGUAGE', ids))])
    return locals()
    

#@auth.requires_login()
def users():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.auth_user, user_signature=False)
    return locals()


def flags():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.FLAG, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('FLAG', ids))])
    return locals()


def ratings():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.RATING, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('RATING', ids))])
    return locals()


def comments():
    """
    *** for testing purposes only***
    """
    grid = SQLFORM.grid(db.COMMENT, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('COMMENT', ids))])
    return locals()


def delete_multiple(table, ids):
    if table == 'QUOTE':
        to_delete = db(db.QUOTE.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORK':
        to_delete = db(db.WORK.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORK_TR':
        to_delete = db(db.WORK_TR.id.belongs(ids))
        to_delete.delete()
    elif table == 'AUTHOR':
        to_delete = db(db.AUTHOR.id.belongs(ids))
        to_delete.delete()
    elif table == 'AUTHOR_TR':
        to_delete = db(db.AUTHOR_TR.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORK_AUTHOR':
        to_delete = db(db.WORK_AUTHOR.id.belongs(ids))
        to_delete.delete()
    elif table == 'QUOTE_WORK':
        to_delete = db(db.QUOTE_WORK.id.belongs(ids))
        to_delete.delete()
    elif table == 'LANGUAGE':
        to_delete = db(db.LANGUAGE.id.belongs(ids))
        to_delete.delete()
    elif table == 'FLAG':
        to_delete = db(db.FLAG.id.belongs(ids))
        to_delete.delete()
    elif table == 'RATING':
        to_delete = db(db.RATING.id.belongs(ids))
        to_delete.delete()
    elif table == 'COMMENT':
        to_delete = db(db.COMMENT.id.belongs(ids))
        to_delete.delete()
        

