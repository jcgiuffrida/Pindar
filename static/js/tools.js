/* include methods to show quotes, authors, and works

# no page should build this content without calling these methods

*/

// global variables
var anthResponses = [];
var anthItems = [];
var anthSelections = [];
var anthsToLoad = 2;

// when anthsToLoad = 0, then we can use them

// get anthologies
if (user !== 0){
  $.getJSON('/Pindar/api/anthologies?user=' + user, function(response){
    anthsToLoad -= 1;
    for (a in response.anthologies){
      anthResponses.push({ id: response.anthologies[a].ANTHOLOGY.id,
        name: response.anthologies[a].ANTHOLOGY.Name,
        quotecount: response.anthologies[a]._extra['COUNT(SELECTION.AnthologyID)'] });
    }
    anthResponses.forEach(function(a){
      anthItems.push('<li><a href="#" class="anthology-' + a.id +
        '" data-id="' + a.id + '">' + a.name + ' <span class="badge">' +
        a.quotecount + ' quote' + plural(a.quotecount) + '</span>' +
        '<div class="pull-left anthology-check"></div></a></li>');
    });
  });

  $.getJSON('/Pindar/api/selections', function(response){
    anthsToLoad -= 1;
    for (s in response.selections){
      anthSelections.push({
        'anthology': response.selections[s].ANTHOLOGY.id,
        'name': response.selections[s].ANTHOLOGY.Name,
        'quote': response.selections[s].SELECTION.QuoteID
      });
    }
  });
} else {
  anthsToLoad = 0;
}


// clean search input
function cleanSearchInput(input){
  var inputs = input.split(' ');
  var cleanedInputs = [];
  inputs.forEach(function(i){
    if (i.length > 1){
      cleanedInputs.push(i);
    }
  });
  return cleanedInputs.join(" ");
}




function parseQuotes(quotesObject, size){
  /*
    takes a JSON quotes object from /api/text_query
    returns a 2xN grid of quote tiles
    improve: add parameters for # columns, features to show
  */
  if(typeof(size)==='undefined') size = "small";
  var quotes = [];
  for (c in quotesObject){
    object = '';
    q = quotesObject[c];
    /*if (parseInt(c) % columns === 0 | parseInt(c) === 0){
      object += '<div class="row">';
    }*/
    object += '<div class="object" data-id="' + q.QUOTE.id +
      '" data-rating="' + q._extra['AVG(RATING.Rating)'] +
      '" data-rating-count="' + q._extra['COUNT(RATING.id)'] +
      '" data-comments="' + q._extra['comments'] +
      '" data-connections="' + q._extra['connections'] +
      '" data-creator="' + q.QUOTE.created_by + '">';
    object += '<div class="object-data panel panel-default">';
    object += '<div class="panel-body"><p class="text">';
    if (q.QUOTE.Text.length > 1000){
      object += q.QUOTE.Text.slice(0, q.QUOTE.Text.indexOf(' ', 990)) +
        ' ... <a href="/Pindar/default/quotes/' + q.QUOTE.id + '">(Read more)</a>';
    } else {
      object += q.QUOTE.Text;
    }
    object += '</p><div class="sources"><a class="btn btn-default btn-sm" ';
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


function parseAuthors(authorsObject, unwrapped){
  /*
    takes a JSON authors object from /api/author_query
    unwrapped = without the wrapper divs (ready to insert into a list-group)
    returns a list group of authors
    improve: add parameter for features to show
  */
  if(typeof(unwrapped)==='undefined') unwrapped = false;
  var authors = undefined;
  if (!unwrapped){
    authors = '<div class="row"><div class="list-group">';
  } else {
    authors = [];
  }
  for (c in authorsObject){
    a = authorsObject[c];
    object = '<a class="list-group-item" ' +
      'data-author-id="' + a.AUTHOR.id +
      '" data-author-tr-id="' + a.AUTHOR_TR.id +
      '" href="/Pindar/default/authors/' + a.AUTHOR_TR.id + '">';
    object += a.AUTHOR_TR.DisplayName;
    object += getDates(a.AUTHOR.YearBorn, a.AUTHOR.YearDied, 'author');
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


function parseWorks(worksObject, unwrapped, author){
  /*
    takes a JSON works object from /api/work_query
    unwrapped = without the wrapper divs (ready to insert into a list group)
    author = show author name
    returns a list group of works
    improve: add parameters for features to show
  */
  if(typeof(unwrapped)==='undefined') unwrapped = false;
  if(typeof(author)==='undefined') author = true;
  var works = undefined;
  if (!unwrapped){
    works = '<div class="row"><div class="list-group">';
  } else {
    works = [];
  }
  for (c in worksObject){
    w = worksObject[c];
    object = '<a class="list-group-item" ' +
      'data-work-id="' + w.WORK.id +
      '" data-work-tr-id="' + w.WORK_TR.id +
      '" href="/Pindar/default/works/' + w.WORK_TR.id + '">';
    object += w.WORK_TR.WorkName;
    object += getDates(w.WORK.YearPublished, w.WORK.YearWritten, 'work');
    // if (w.WORKTYPE.TypeName != null){
    //   object += '<span><i> (' + w.WORKTYPE.TypeName + ')</i></span>';
    // }
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

// prevent enter from ever submitting form, except in navbar and main page
$(document).on('keypress', 'form', function (e) {
  var code = e.keyCode || e.which;
  if ($(this).hasClass('navbar-form') || $(this).hasClass('main-page-search')){
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
  // return the string capitalized, in title case
  if(typeof(delim)==='undefined') delim = " ";
  var strings = this.trim().split(delim);
  for (var i = 0; i < strings.length; i++){
    // fromhttp://writers.stackexchange.com/questions/4621/which-words-should-not-be-capitalized-in-title-case
    if (["a", "an", "the", "and", "but", "for", "nor", "or", "at", "by", "for", "from", "in", "of", "on", "to", "with"].indexOf(strings[i]) !== -1 && i !== 0 && i !== strings.length - 1){
      // don't capitalize
      strings[i] = strings[i]
    } else {
      strings[i] = strings[i].charAt(0).toUpperCase() + strings[i].slice(1);
    }
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

function getDates(date1, date2, type){
  var str = '';
  if (_validDate(date1) && date1 < 0){
    date1 = (0 - date1) + ' BC';
  }
  if (_validDate(date2) && date2 < 0){
    date2 = (0 - date2) + ' BC';
  }
  if (_validDate(date1)){
    if (_validDate(date2)){
      // both dates
      if (type == 'author'){
        str = ' (' + date1 + ' - ' + date2 + ')';
      } else {
        str = ' (' + date1 + ')';
      }
    } else {
      // no date2
      if (type == 'author'){
        str = ' (b. ' + date1 + ')';
      } else {
        str = ' (' + date1 + ')';
      }
    }
  } else {
    if (_validDate(date2)){
      // no date1
      if (type == 'author'){
        str = ' (d. ' + date2 + ')';
      } else {
        str = ' (' + date2 + ')';
      }
    } else {
      // no dates
      str = '';
    }
  }
  return str;
}

function reflectTypeChange(el, authorWork, type){
  // alter which fields and labels are shown based on the type
  if (authorWork == 'author'){
    switch(type.trim()){
      case "Person":
        $('#AUTHOR_TR-FirstName').closest('.form-group').show();
        $('#AUTHOR_TR-Biography').closest('div').siblings('label')
          .text('Biography');
        $('#AUTHOR-YearBorn').closest('div').siblings('label').eq(0)
          .text('Dates');
        break;
      case "Band":
        $('#AUTHOR_TR-FirstName').closest('.form-group').hide();
        $('#AUTHOR_TR-Biography').closest('div').siblings('label')
          .text('Biography');
        $('#AUTHOR-YearBorn').closest('div').siblings('label').eq(0)
          .text('Dates Active');
        break;
      case "Anonymous":
        $('#AUTHOR_TR-FirstName').closest('.form-group').hide();
        $('#AUTHOR_TR-Biography').closest('div').siblings('label')
          .text('Biography (if known)');
        $('#AUTHOR-YearBorn').closest('div').siblings('label').eq(0)
          .text('Approximate dates');
        break;
      default: // company or public entity
        $('#AUTHOR_TR-FirstName').closest('.form-group').hide();
        $('#AUTHOR_TR-Biography').closest('div').siblings('label')
          .text('Description');
        $('#AUTHOR-YearBorn').closest('div').siblings('label').eq(0)
          .text('Dates Active');
    }
  } else {
    switch(type.trim()){
      case "Book":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').show();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description of book');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Publication year');
        $('#WORK-YearWritten').closest('div').show()
          .siblings('label').eq(1).show();
        break;
      case "Poem":
      case "Essay":
      case "Other Publication":
      case "Short Story":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Publication year');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      case "Song":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description of song');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year released');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      case "Speech":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Location and audience of speech');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      case "Private Letter":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Recipient ("Letter to...")');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      case "In Conversation":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Context ("In conversation with...")');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      case "Film":
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year Released');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
        break;
      default:
        $('#WORK_TR-WorkName').closest('div').siblings('label')
          .text('Title');
        $('#WORK_TR-WorkSubtitle').closest('.form-group').hide();
        $('#WORK_TR-WorkDescription').closest('div').siblings('label')
          .text('Description');
        $('#WORK-YearPublished').closest('div').siblings('label').eq(0)
          .text('Year');
        $('#WORK-YearWritten').closest('div').hide()
          .siblings('label').eq(1).hide();
    }
  }
}

// return true if date exists and is valid in both javascript and python
function _validDate(d){
  return (d && d !== 'None');
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
  $('.search-box .glyphicon-remove').hide();
  $('.search-box .glyphicon-refresh').hide();
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
      trigger('input').trigger('keyup');
  });

  // navbar scrolling
  $(window).on('scroll', function() {
    if (Math.round($(window).scrollTop()) > 100) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });
});

