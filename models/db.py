# -*- coding: utf-8 -*-
from datetime import datetime

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

## local
db = DAL('mysql://bunny:rochester@localhost/pindar',pool_size=1,
  check_reserved=['mysql', 'postgres'],
  driver_args={"unix_socket":"/tmp/mysql.sock"})

## deployment
# db = DAL('mysql://pindar:rochester@pindar.mysql.pythonanywhere-services.com/pindar$default',
#   pool_size=1, check_reserved=['mysql', 'postgres'])

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else [] # but note http://slides.com/amberdoctor/angularjs_and_web2py
## (optional) optimize handling of static files
response.optimize_css = 'concat,minify,inline'
response.optimize_js = 'concat,minify,inline'
## (optional) static assets folder versioning
response.static_version = '0.0.0'


# extra functions
def plural(num):
    if num == 1:
        return ''
    else:
        return 's'

def sanitize(q):
    return XML(q.replace('\n', '<br/>').\
          replace('    ', '&nbsp;&nbsp;&nbsp;&nbsp;'), sanitize=True)


from gluon.tools import Auth, Crud, Service, PluginManager, prettydate
auth = Auth(db)
crud, service, plugins = Crud(db), Service(), PluginManager()

auth.settings.extra_fields['auth_user'] = [
    Field('DateJoined', 'datetime', default=datetime.now(),
          readable=False, writable=False),
    Field('PrimaryLanguageID', 'integer', default=1),
    Field('UserBiography', 'text'),
    Field('IsDeleted', 'boolean', default=False, readable=False, writable=False)]

## create all tables needed by auth if not custom tables
auth.define_tables(username=True, signature=False)


# add signature to all tables (turn off cascade)
auth_signature = db.Table(db,'auth_signature',
	Field('created_on','datetime',default=request.now,
		writable=False,readable=False),
	Field('created_by',auth.settings.table_user,default=auth.user_id,
		writable=False,readable=False,ondelete='SET NULL'),
	Field('modified_on','datetime',update=request.now,default=request.now,
		writable=False,readable=False),
	Field('modified_by',auth.settings.table_user,
		default=auth.user_id,update=auth.user_id,
		writable=False,readable=False,ondelete='SET NULL'))


## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' or 'smtp.gmail.com:587'
mail.settings.sender = 'you@gmail.com'
mail.settings.login = 'username:password'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.rpx_account import use_janrain
use_janrain(auth, filename='private/janrain.key')

#########################################################################
## Define your tables below (or better in another model file) for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################

###---------------------- LANGUAGE

# this is limited to admin
db.define_table('LANGUAGE',
			Field('LanguageCode', 'string', length=3, label='Two-letter code'),
			Field('EnglishName', 'string', length=64, label='English name'),
			Field('NativeName', 'string', length=64, required=True, label='Native name'))

db.LANGUAGE.LanguageCode.requires = IS_LENGTH(minsize=2, maxsize=3)
db.LANGUAGE.EnglishName.requires = IS_LENGTH(minsize=2, maxsize=64)
db.LANGUAGE.NativeName.requires = [IS_NOT_EMPTY(), IS_LENGTH(minsize=2, maxsize=64)]

# add reference in auth_user table
db.auth_user.PrimaryLanguageID.type = 'reference LANGUAGE'
db.auth_user.PrimaryLanguageID.requires = IS_IN_DB(db, db.LANGUAGE.id, '%(NativeName)s')



###---------------------- QUOTE

db.define_table('QUOTE',
            Field('Text', 'text', required=True),
            Field('QuoteLanguageID', 'reference LANGUAGE', required=True,
            		default=1, label='Language', ondelete='SET NULL'), # temporary default for testing purposes
            Field('IsOriginalLanguage', 'boolean', label='Quote is in original language'),
            Field('IsDeleted', 'boolean', default=False, readable=False, writable=False),
            Field('Note', 'text', label='Context or additional information'),
            auth_signature)

db.QUOTE.Text.requires = [IS_NOT_EMPTY(), IS_NOT_IN_DB(db, db.QUOTE.Text)]
db.QUOTE.QuoteLanguageID.requires = IS_IN_DB(db, db.LANGUAGE.id, '%(NativeName)s')
db.QUOTE.Note.requires = IS_LENGTH(maxsize=4096)
# we may want to decrease this max character size: currently allows >500 words


###---------------------- WORK

### note: it should not be possible to enter a WORK without joining it
### to a WORK_TR. same with authors

db.define_table('WORK',
            Field('YearPublished', 'integer', label='Year published'),
            Field('YearWritten', 'integer', label='Year written (if different)'),
            Field('IsHidden', 'boolean', default=False, readable=False,
              writable=False),
            auth_signature)

db.WORK.YearPublished.requires = IS_INT_IN_RANGE(-5000,2050)
db.WORK.YearWritten.requires = IS_INT_IN_RANGE(-5000,2050)


###---------------------- WORK_TR

db.define_table('WORK_TR',
			Field('WorkID', 'reference WORK', required=True),
			Field('LanguageID', 'reference LANGUAGE', required=True,
					label='Language of this work or translation', ondelete='SET NULL'),
			Field('WorkName', 'string', length=1024, required=True,
					label='Name of work'),
			Field('WorkSubtitle', 'string', length=1024,
					label='Subtitle'),
			Field('WorkDescription', 'text',
					label='Description of work'),
			Field('WikipediaLink', 'string', length=256,
					label='Link to Wikipedia page'),
			Field('WorkNote', 'text',
					label='Context or additional information'),
      auth_signature)

db.WORK_TR.WorkID.requires = IS_IN_DB(db, db.WORK.id, '%(id)s (%(YearPublished)s)')
db.WORK_TR.LanguageID.requires = IS_IN_DB(db, db.LANGUAGE.id, '%(NativeName)s')
db.WORK_TR.WorkName.requires = [IS_NOT_EMPTY(), IS_LENGTH(maxsize=1024)]
db.WORK_TR.WorkSubtitle.requires = IS_LENGTH(maxsize=1024)
db.WORK_TR.WorkDescription.requires = IS_LENGTH(maxsize=4096)
db.WORK_TR.WikipediaLink.requires = \
		[IS_MATCH('^(https://|http://)?[a-z]{2}\.wikipedia\.org/wiki/.{1,}'),
		 IS_LENGTH(maxsize=256)]
db.WORK_TR.WorkNote.requires = IS_LENGTH(maxsize=4096)


###---------------------- AUTHOR

db.define_table('AUTHOR',
			Field('YearBorn', 'integer'),
			Field('YearDied', 'integer'),
			Field('IsHidden', 'boolean', default=False, readable=False,
        writable=False),
      auth_signature)

db.AUTHOR.YearBorn.requires = IS_INT_IN_RANGE(-5000,2050)
db.AUTHOR.YearDied.requires = IS_INT_IN_RANGE(-5000,2050)


###---------------------- AUTHOR_TR

db.define_table('AUTHOR_TR',
			Field('AuthorID', 'reference AUTHOR', required=True),
			Field('LanguageID', 'reference LANGUAGE', required=True,
					label='Your language', ondelete='SET NULL'),
			Field('FirstName', 'string', length=128,
					label='First name'),
			Field('MiddleName', 'string', length=128,
					label='Middle name'),
			Field('LastName', 'string', length=128,
					label='Last name'),
			Field('AKA', 'list:string',
					label='Other names'),
			Field('DisplayName', 'string', length=512, required=True,
					label='Default name'),
			Field('Biography', 'text'),
			Field('WikipediaLink', 'string', length=256,
					label='Link to Wikipedia page'),
      auth_signature)

db.AUTHOR_TR.AuthorID.requires = IS_IN_DB(
						db, db.AUTHOR.id, '%(id)s (%(YearBorn)s-%(YearDied)s)')
db.AUTHOR_TR.LanguageID.requires = IS_IN_DB(db, db.LANGUAGE.id, '%(NativeName)s')
db.AUTHOR_TR.FirstName.requires = IS_LENGTH(maxsize=128)
db.AUTHOR_TR.MiddleName.requires = IS_LENGTH(maxsize=128)
db.AUTHOR_TR.LastName.requires = IS_LENGTH(maxsize=128)
db.AUTHOR_TR.AKA.requires = IS_LIST_OF(IS_LENGTH(maxsize=256))
db.AUTHOR_TR.DisplayName.requires = [IS_NOT_EMPTY(), IS_LENGTH(maxsize=512)]
db.AUTHOR_TR.Biography.requires = IS_LENGTH(maxsize=8192)
db.AUTHOR_TR.WikipediaLink.requires = \
		[IS_MATCH('^(https://|http://)?[a-z]{2}\.wikipedia\.org/wiki/.{1,}'),
		 IS_LENGTH(maxsize=256)]


###---------------------- QUOTE_WORK

db.define_table('QUOTE_WORK',
			Field('QuoteID', 'reference QUOTE', required=True),
			Field('WorkID', 'reference WORK', required=True))

db.QUOTE_WORK.QuoteID.requires = IS_IN_DB(db, db.QUOTE.id, '%(Text)s')
db.QUOTE_WORK.WorkID.requires = IS_IN_DB(db, db.WORK.id, '%(id)s (%(YearPublished)s)')


###---------------------- WORK_AUTHOR

db.define_table('WORK_AUTHOR',
			Field('WorkID', 'reference WORK', required=True),
			Field('AuthorID', 'reference AUTHOR', required=True))

db.WORK_AUTHOR.AuthorID.requires = IS_IN_DB(db, db.AUTHOR.id,
									'%(id)s (%(YearBorn)s-%(YearDied)s)')
db.WORK_AUTHOR.WorkID.requires = IS_IN_DB(db, db.WORK.id, '%(id)s (%(YearPublished)s)')


###---------------------- TRANSLATION (fill out later)

db.define_table('TRANSLATION',
			Field('OriginalQuoteID', 'reference QUOTE'),
			Field('TranslatedQuoteID', 'reference QUOTE'),
			Field('TranslatorID', 'reference AUTHOR', ondelete='SET NULL'))


###---------------------- FLAG
# the below tables allow any quote, work, or author to be flagged. which ID field is active
# will be contextual. having them all in one table lets us see all flags at once and will
# help if a work if flagged as offensive when in fact the author name is offensive, etc.

db.define_table('FLAGTYPE',
            Field('FlagName', 'string', required=True),
            format='%(FlagName)s')

db.define_table('FLAG',
            Field('QuoteID', 'reference QUOTE'),  # this is not normal - suggestions?
            Field('AuthorID', 'reference AUTHOR_TR'),
            Field('WorkID', 'reference WORK_TR'),
            Field('Type', 'reference FLAGTYPE', required=True),
            Field('IsActive', 'boolean', default=True),
            Field('FlagNote', 'string'),
            auth_signature)

db.FLAG.Type.requires = [IS_NOT_EMPTY(), IS_IN_DB(db, db.FLAGTYPE.id, '%(FlagName)s')]
db.FLAG.created_by.readable=True
db.FLAG.created_on.readable=True


###---------------------- RATING

db.define_table('RATING',
            Field('Rating', 'decimal(4,3)', required=True),
            Field('QuoteID', 'reference QUOTE', required=True),
            auth_signature)

db.RATING.Rating.requires = [IS_NOT_EMPTY(), IS_DECIMAL_IN_RANGE(0,5,dot=".")]
db.RATING.QuoteID.requires = [IS_NOT_EMPTY(), IS_IN_DB(db, db.QUOTE.id, '%(Text)s')]
db.RATING.created_by.readable=True
db.RATING.created_on.readable=True
db.RATING.modified_by.readable=True
db.RATING.modified_on.readable=True


###---------------------- COMMENTS
db.define_table('COMMENT',
            Field('Text', 'text', required=True),
            Field('QuoteID', 'reference QUOTE', required=True),
            Field('Active', 'boolean', default=True, readable=False,
              writable=False),
            auth_signature)

db.COMMENT.Text.requires = IS_NOT_EMPTY()
db.COMMENT.QuoteID.requires = [IS_NOT_EMPTY(), IS_IN_DB(db, db.QUOTE.id, '%(Text)s')]
db.RATING.created_by.readable=True
db.RATING.created_on.readable=True





## enable record versioning only on important tables
db.QUOTE._enable_record_versioning()
db.AUTHOR._enable_record_versioning()
db.AUTHOR_TR._enable_record_versioning()
db.WORK._enable_record_versioning()
db.WORK_TR._enable_record_versioning()
db.FLAG._enable_record_versioning()
db.COMMENT._enable_record_versioning()
