

var advancedVisible = false;



$(document).ready(function(){
  var quotesFunction = function(){
    return 'lookup=' + $('#textQuery').val() + '&sort=' + $('#sortOrder').val();
  };
  var defaultFunction = function(){ return 'sort=' + $('#sortOrder').val(); };
  var advancedQuotesFunction = function(){
    return 'lookup=' + $('#textQuery').val() +
      '&author=' + $('#advancedAuthor').val() +
      '&work=' + $('#advancedWork').val() +
      '&language=' + $('#advancedLanguage').val() +
      '&minDate=' + $('#advancedMinDate').val() +
      '&maxDate=' + $('#advancedMaxDate').val() +
      '&minRating=' + $('#advancedMinRating').val() +
      '&sort=' + $('#sortOrder').val();
  };
  $('.default-content .search-quotes').searchify({
    searchFunction: quotesFunction,
    highlightTerms: true,
    cols: 1
  });
  $('.default-content .search-authors').searchify({type: 'authors'});
  $('.default-content .search-works').searchify({type: 'works'});
  $('.default-content .show-quotes').searchify({
    searchFunction: defaultFunction,
    cols: 1,
    isDefault: true,
    searchOnLoad: (typeof searchOnLoad !== 'undefined' ? searchOnLoad : true)
  });
  $('.default-content .show-authors').searchify({
    type: 'authors',
    searchFunction: defaultFunction,
    isDefault: true,
    searchOnLoad: (typeof searchOnLoad !== 'undefined' ? searchOnLoad : true)
  });
  $('.default-content .show-works').searchify({
    type: 'works',
    searchFunction: defaultFunction,
    isDefault: true,
    searchOnLoad: (typeof searchOnLoad !== 'undefined' ? searchOnLoad : true)
  });
  $('#sortOrder').on('change', function(){
    if ($('.default-content .show-quotes').is(':visible')){
      $('.default-content .show-quotes').trigger('search');
    }
  });

  // initiate advanced
  $('.advanced-content .search').searchify({
    type: 'quotes',
    searchFunction: advancedQuotesFunction,
    isAdvanced: true,
    highlightTerms: true,
    cols: 2
  });
  $('.advanced-content .search').trigger('sleep');

  // trigger input in case there's text in the box on page load
  $('#textQuery').trigger('input');

  // switch between basic and advanced search
  $('.search-bar').on('click', '.show-advanced', function(){
    if ($('.advanced-searchbar').is(':visible')){
      // switch back to basic search
      $(this).html('Advanced <i class="fa fa-chevron-down"></i>');
      $('.advanced-searchbar').find('.select2-search-choice').fadeOut('fast');
      $('.advanced-searchbar').slideUp();
      $('#textQuery').attr('placeholder', 'Search everything');
      advancedVisible = false;
      $('.advanced-content').hide();
      $('.default-content').show();
      $('.advanced-content .search').trigger('sleep');
      $('.default-content .search').trigger('wake');
    } else {
      // switch to advanced search
      $(this).html('Advanced <i class="fa fa-chevron-up"></i>');
      $('.advanced-searchbar').find('.select2-search-choice').fadeIn('slow');
      $('.advanced-searchbar').slideDown();
      $('#textQuery').attr('placeholder', 'Search quotes');
      advancedVisible = true;
      $('.default-content .search').trigger('sleep');
      $('.advanced-content .search').trigger('wake');
      $('.default-content').hide();
      $('.advanced-content').show();
    }
  });

  // fill in languages filter
  $.getJSON('/Pindar/api/language_query', function(response){
    var languagesArray = [];
    for (c in response.languages){
      languagesArray.push({id: response.languages[c].LANGUAGE.id,
        text: response.languages[c].LANGUAGE.NativeName});
    }
    $("#advancedLanguage").select2({
      data: languagesArray,
      multiple: true,
      placeholder: "Filter languages"
    });
  });

  // authors
  $("#advancedAuthor").select2({
    ajax: {
      url: "/Pindar/api/author_query",
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
          lookup: params
        };
      },
      results: function (data) {
        var myResults = [];
        $.each(data.authors, function (index, item) {
          myResults.push({
            'id': item.AUTHOR_TR.id,
            'text': item.AUTHOR_TR.DisplayName,
            'works': item['_extra']['COUNT(WORK_AUTHOR.WorkID)'] - 1
          });
        });
        console.log(myResults);
        return {
          results: myResults
        };
      },
      cache: true
    },
    multiple: true,
    placeholder: 'Filter authors',
    escapeMarkup: function (markup) { return markup; },
    minimumInputLength: 2,
    formatResult: formatAuthorResult
  });

  // works
  $("#advancedWork").select2({
    ajax: {
      url: "/Pindar/api/work_query",
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
          lookup: params,
          author: $('#advancedAuthor').val()
        };
      },
      results: function (data) {
        var myResults = [];
        $.each(data.works, function (index, item) {
          myResults.push({
            'id': item.WORK_TR.id,
            'text': item.WORK_TR.WorkName,
            'quotes': item['_extra']['COUNT(QUOTE_WORK.QuoteID)'],
            'author': item.AUTHOR_TR.DisplayName
          });
        });
        console.log(myResults);
        return {
          results: myResults
        };
      },
      cache: true
    },
    multiple: true,
    placeholder: 'Filter works',
    escapeMarkup: function (markup) { return markup; },
    minimumInputLength: 2,
    formatResult: formatWorkResult,
    formatSelection: formatWorkSelection
  });

  function formatAuthorResult (r) {
    var markup = '<div class="row"><div class="col-sm-12">' +
      r.text;
    if (r.works > 0){
      markup += '<span class="badge pull-right">' +
      r.works + ' work' + plural(r.works) + '</span>';
    }
    markup += '</div></div>';
    return markup;
  }

  function formatWorkResult (r) {
    var markup = '<div class="row"><div class="col-sm-12">' +
      r.text;
    if (r.text == 'Attributed'){
      // give author name
      markup += ' to ' + r.author;
    }
    if (r.quotes > 0){
      markup += '<span class="badge pull-right">' + r.quotes + ' quote' +
        plural(r.quotes) + '</span>';
    }
    markup += '</div></div>';
    return markup;
  }

  function formatWorkSelection (r) {
    if (r.text == 'Attributed'){
      // give author name
      return r.text + ' to ' + r.author;
    } else {
      return r.text;
    }
  }



});



