/* include methods to show quotes, authors, and works

# no page should build this content without calling these methods

*/


function parseQuotes(quotesObject, size, max){
  /* 
    takes a JSON quotes object from /api/text_query
    returns a 2xN grid of quote tiles 
    improve: add parameters for # columns, features to show
  */
  if(typeof(size)==='undefined') size = "small";
  if(typeof(max)==='undefined') max = 12;
  var quotes = [];
  for (c in quotesObject){
    if (c >= max){ break; }
    object = '';
    q = quotesObject[c];
    /*if (parseInt(c) % columns === 0 | parseInt(c) === 0){
      object += '<div class="row">';
    }*/
    object += '<div class="object" data-id="' + q.QUOTE.id + 
      '" data-rating="' + q._extra['AVG(RATING.Rating)'] + 
      '" data-rating-count="' + q._extra['COUNT(RATING.Rating)'] + '">';
    object += '<div class="object-data panel panel-default">';
    object += '<div class="panel-body"><p class="text">';
    if (q.QUOTE.Text.length > 500){
      object += q.QUOTE.Text.slice(0, q.QUOTE.Text.indexOf(' ', 490)) + 
        ' ...';
    } else {
      object += q.QUOTE.Text;
    }
    object += '</p><div><a class="btn btn-default btn-sm" ';
    object += 'href="/Pindar/default/authors/' + q.AUTHOR_TR.id + '">';
    object += q.AUTHOR_TR.DisplayName + '</a> ';
    object += '<a class="btn btn-default btn-sm" ';
    object += 'href="/Pindar/default/works/' + q.WORK_TR.id + '">';
    object += q.WORK_TR.WorkName + '</a>';
    object += '</div><div class="object-actions"></div></div></div></div>';
    
    /*if ((parseInt(c) + 1) % columns === 0){
      object += '</div>';
    }*/
    quotes.push($(object));
  }
  return quotes;
}


function parseAuthors(authorsObject, unwrapped, max){
  /* 
    takes a JSON authors object from /api/author_query
    unwrapped = without the wrapper divs (ready to insert into a list-group)
    returns a list group of authors
    improve: add parameter for features to show
  */
  if(typeof(unwrapped)==='undefined') unwrapped = false;
  if(typeof(max)==='undefined') max = 10;
  var authors = undefined;
  if (!unwrapped){
    authors = '<div class="row"><div class="list-group">';
  } else {
    authors = [];
  }
  for (c in authorsObject){
    if (c >= max){ break; }
    a = authorsObject[c];
    object = '<a class="list-group-item" ' + 
      'data-author-id="' + a.AUTHOR.id + 
      '" data-author-tr-id="' + a.AUTHOR_TR.id + 
      '" href="/Pindar/default/authors/' + a.AUTHOR_TR.id + '">';
    object += a.AUTHOR_TR.DisplayName;
    object += getAuthorDates(a.AUTHOR.YearBorn, a.AUTHOR.YearDied);
    workcount = a['_extra']['COUNT(WORK_AUTHOR.WorkID)'] - 1; // minus 'attributed'
    if (workcount > 0){
      object += '<span class="badge">';
      object += workcount;
      if (workcount == 1){
        object += ' work</span>';
      } else {
        object += ' works</span>';
      }
    }
    object += '</a>';
    if (unwrapped){
      object = $(object);
      authors.push(object);
    } else {
      authors += object;  
    }
  }
  if (!unwrapped){
    authors += '</div></div>';
  }
  return authors;
}


function parseWorks(worksObject, unwrapped, author, max){
  /*
    takes a JSON works object from /api/work_query
    unwrapped = without the wrapper divs (ready to insert into a list group)
    author = show author name
    returns a list group of works
    improve: add parameters for features to show
  */
  if(typeof(unwrapped)==='undefined') unwrapped = false;
  if(typeof(author)==='undefined') author = true;
  if(typeof(max)==='undefined') max = 10;
  var works = undefined;
  if (!unwrapped){
    works = '<div class="row"><div class="list-group">';
  } else {
    works = [];
  }
  for (c in worksObject){
    if (c >= max){ break; }
    w = worksObject[c];
    object = '<a class="list-group-item" ' + 
      'data-work-id="' + w.WORK.id + 
      '" data-work-tr-id="' + w.WORK_TR.id + 
      '" href="/Pindar/default/works/' + w.WORK_TR.id + '">';
    object += w.WORK_TR.WorkName;
    if (w.WORK.YearPublished != null){
      object += ' (' + w.WORK.YearPublished + ')';
    } else if (w.WORK.YearWritten != null){
      object += ' (' + w.WORK.YearWritten + ')';
    }
    quotecount = w['_extra']['COUNT(QUOTE_WORK.QuoteID)'];
    if (quotecount > 0){
      object += '<span class="badge">' + quotecount + ' quote' + 
        plural(quotecount) + '</span>';
    }
    if (author){
      object += '<p class="small">' + w.AUTHOR_TR.DisplayName + '</p>';
    }
    object += '</a>';
    if (unwrapped){
      works.push($(object));
    } else {
      works += object;  
    }
  }
  if (!unwrapped){
    works += '</div></div>';
  }
  return works;
}

// prevent enter from ever submitting form, except in navbar
$(document).on('keypress', 'form', function (e) {
  var code = e.keyCode || e.which;
  if ($(this).hasClass('navbar-form')){
    if ($(this).find('input').val().length > 1){
      // do nothing
    } else if (code == 13){
      e.preventDefault();
    }
  } else if ($(this).find('textarea').is(':focus')){
    // allow enter in textarea
  } else if ($(this).hasClass('search-bar') & 
      $(this).find('.advanced-searchbar').is(':visible') & 
      code == 13){
        $(this).find('.run-advanced-search').trigger('click');
  } else if (code == 13){
    e.preventDefault();
  }
});

function isCharacterKeyPress(evt) {
  if (typeof evt.which == "undefined") {
      // This is IE, which only fires keypress events for printable keys
      return true;
  } else if (typeof evt.which == "number" && evt.which > 0) {
      // In other browsers except old versions of WebKit, evt.which is
      // only greater than zero if the keypress is a printable key.
      // We need to filter out backspace and ctrl/alt/meta key combinations
      return !evt.ctrlKey && !evt.metaKey && !evt.altKey && !evt.shiftKey;
  }
  return false;
}

String.prototype.capitalize = function(delim) {
  if(typeof(delim)==='undefined') delim = " ";
  var strings = this.split(delim);
  for (var i = 0; i < strings.length; i++){
    strings[i] = strings[i].charAt(0).toUpperCase() + strings[i].slice(1);
  }
    return strings.join(' ');
}

String.prototype.sanitize = function(){
  return this.replace(/\n/g, "<br>").replace(/;/g, '%3B');
}

function plural(num){
  if (num == 1){
    return '';
  } else {
    return 's';
  }
}

function getAuthorDates(bdate, ddate){
  var str = '';
  if (bdate){
    if (ddate){
      // both dates
      str = ' (' + bdate + ' - ' + ddate + ')';
    } else {
      // no ddate
      str = ' (b. ' + bdate + ')';
    }
  } else {
    if (ddate){
      // no bdate
      str = ' (d. ' + ddate + ')';
    } else {
      // no dates
      str = '';
    }
  }
  return str;
}

// functionality to apply on EVERY page
$(document).ready(function(){
  // navbar functionality
  $('.navbar-form input').on('input', function(){
    if ($(this).val().length < 2){
      $(this).closest('.navbar-form').find('button').fadeOut();  
    } else {
      $(this).closest('.navbar-form').find('button').fadeIn();  
    }
  });
  $('.navbar-form').on('submit', function(e){
    e.preventDefault();
    window.location.href='/Pindar/default/show?search=' + 
      $(this).closest('.navbar-form').find('input').val();
  })

  // clear search boxes
  $('.glyphicon-remove').hide();
  $(document).on('.search-box input', 'input', function(){
    var val = $(this).val();
    if (val.length > 0){
      $(this).closest('.search-box').find('.glyphicon-remove').show();
    } else {
      $(this).closest('.search-box').find('.glyphicon-remove').hide();
    }
  });
  $(document).on('click', '.glyphicon-remove', function(){
    $(this).closest('.search-box').find('input').val('').focus().
      trigger('input');
  });

});
