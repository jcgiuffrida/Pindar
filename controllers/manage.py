# -*- coding: utf-8 -*-

# controller for admin tools, letting administrators see, change, and delete the data


@auth.requires_membership('overlord')
def quotes():
    grid = SQLFORM.grid(db.QUOTE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('QUOTE', ids))])
    return locals()


@auth.requires_membership('overlord')
def works():
    grid1 = SQLFORM.grid(db.WORK, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK', ids))])
    grid2 = SQLFORM.grid(db.WORK_TR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK_TR', ids))])
    grid3 = SQLFORM.grid(db.WORKTYPE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORKTYPE', ids))])
    return locals()


@auth.requires_membership('overlord')
def authors():
    grid1 = SQLFORM.grid(db.AUTHOR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('AUTHOR', ids))])
    grid2 = SQLFORM.grid(db.AUTHOR_TR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('AUTHOR_TR', ids))])
    grid3 = SQLFORM.grid(db.AUTHORTYPE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('AUTHORTYPE', ids))])
    return locals()


@auth.requires_membership('overlord')
def auxiliary_tables():
    grid1 = SQLFORM.grid(db.QUOTE_WORK, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('QUOTE_WORK', ids))])
    grid2 = SQLFORM.grid(db.WORK_AUTHOR, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('WORK_AUTHOR', ids))])
    return locals()


@auth.requires_membership('overlord')
def languages():
    grid = SQLFORM.grid(db.LANGUAGE, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('LANGUAGE', ids))])
    return locals()


@auth.requires_membership('overlord')
def users():
    grid = SQLFORM.grid(db.auth_user, user_signature=False)
    return locals()


@auth.requires_membership('overlord')
def flags():
    grid = SQLFORM.grid(db.FLAG, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('FLAG', ids))])
    return locals()


@auth.requires_membership('overlord')
def ratings():
    grid = SQLFORM.grid(db.RATING, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('RATING', ids))])
    return locals()


@auth.requires_membership('overlord')
def comments():
    grid = SQLFORM.grid(db.COMMENT, user_signature=False,
        selectable=[('Delete', lambda ids: delete_multiple('COMMENT', ids))])
    return locals()


@auth.requires_membership('overlord')
def anthologies():
    grid1 = SQLFORM.grid(db.ANTHOLOGY, user_signature=True,
        selectable=[('Delete', lambda ids: delete_multiple('ANTHOLOGY', ids))])
    grid2 = SQLFORM.grid(db.SELECTION, user_signature=True,
        selectable=[('Delete', lambda ids: delete_multiple('SELECTION', ids))])
    return locals()

@auth.requires_membership('overlord')
def connections():
    grid1 = SQLFORM.grid(db.CONNECTION, user_signature=True,
        selectable=[('Delete', lambda ids: delete_multiple('CONNECTION', ids))])
    return locals()


def delete_multiple(table, ids):
    ''' allows us to make bulk changes'''
    if table == 'QUOTE':
        to_delete = db(db.QUOTE.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORKTYPE':
        to_delete = db(db.WORKTYPE.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORK':
        to_delete = db(db.WORK.id.belongs(ids))
        to_delete.delete()
    elif table == 'WORK_TR':
        to_delete = db(db.WORK_TR.id.belongs(ids))
        to_delete.delete()
    elif table == 'AUTHORTYPE':
        to_delete = db(db.AUTHORTYPE.id.belongs(ids))
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
    elif table == 'ANTHOLOGY':
        to_delete = db(db.ANTHOLOGY.id.belongs(ids))
        to_delete.delete()
    elif table == 'SELECTION':
        to_delete = db(db.SELECTION.id.belongs(ids))
        to_delete.delete()
    elif table == 'CONNECTION':
        to_delete = db(db.CONNECTION.id.belongs(ids))
        to_delete.delete()

