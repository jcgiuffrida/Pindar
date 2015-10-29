
/* for all pages */




// okay, here we go
$.fn.searchify = function(options){

  var settings = $.extend({
    type: 'quotes',
    searchInput: $('#textQuery'),
    searchFunction: function(){ return 'lookup=' + settings.searchInput.val(); },
    objectsToShow: 30,
    cols: 2,
    pagination: true,
    isDefault: false,
    isAdvanced: false,
    showAuthor: true,
    highlightTerms: false,
    searchOnLoad: true,
    advancedSearchButton: $('.run-advanced-search'),
    clearAdvancedSearchButton: $('.clear-advanced-search')
  }, options);

  var searchDiv = $(this);
  if (settings.isDefault){
    var defaultDiv = $('');
  } else {
    var defaultDiv = searchDiv.parent('div').find('.default').first();
  }

  var countBadge = searchDiv.parent('div').find('.results-count');
  var showSpinner;

  // pagination variables
  var objectsStorage = [];
  var moreObjectsExist = false;
  var objectsOffset = 0;
  var objectsQuery = '';
  var objectsRetrieved = 0;
  // these need to be the same as the API limits in api.py
  var quotesAPILimit = 10, authorsAPILimit = 6, worksAPILimit = 6;

  // search variables
  var searching = false;
  var lastSearched = '';
  var pendingSearch;
  var searchInterval = undefined;

  var objectsFadeQueue = [];




  function buildBtnShowMore(objects){
    return $('<div class="col-md-8 col-md-offset-2">' +
    '<button type="button" class="btn btn-default btn-block btn-' + objects +
    '-more">Show more ' + objects + '</button></div>');
  }

  // this is the master function
  function handleSearchInput(el){
    if (!settings.isAdvanced){
      return function(){
        el.on('input', function(){
          // show search or default sections as appropriate
          if (el.val().length < 2){
            if (searchDiv.is(':visible')){
              searchDiv.hide().empty();
              defaultDiv.show();
              updateCountBadge("");
            }
            settings.searchInput.siblings('.glyphicon-refresh').hide();
            clearTimeout(showSpinner);
          } else {;
            // first, check that no searches are already running
            var query = settings.searchFunction();
            if (searching){
              clearTimeout(pendingSearch); // cancel any other timers
              // check every 200 ms for permission to search
              pendingSearch = setTimeout(function(){checkTimer(query)}, 100);
            } else {
              searching = true;
              // after 500 ms, allow add'l searches
              setTimeout(function(){searching=false;}, 400);
              lastSearched = query;
              runSearch(query);
            }
          }
        });

        // frequently check the input field, in case it's lagging behind search
        searchInterval = window.setInterval(function(){
          if (lastSearched != settings.searchFunction()){
            el.trigger('input');
          }
        }, 750);
      };
    } else {
      return function(){
        settings.advancedSearchButton.on('click', function(e){
          e.preventDefault;
          var query = settings.searchFunction();
          if (searching){
            clearTimeout(pendingSearch);
            pendingSearch = setTimeout(function(){checkTimer(query)}, 100);
          } else {
            searching = true;
            setTimeout(function(){searching=false;}, 400);
            lastSearched = query;
            runSearch(query);
          }
        });
        settings.clearAdvancedSearchButton.on('click', function(e){
          e.preventDefault;
          if (searchDiv.is(':visible')){
            searchDiv.hide().empty();
            defaultDiv.show();
          }
          settings.searchInput.closest('.search-bar').find('input').val('');
          settings.searchInput.closest('.search-bar').find('input').
            select2("val", "");

        });
      };
    }
  }

  // this adds a search to the queue
  function queueSearch(query){
    if (searching){
      clearTimeout(pendingSearch);
      pendingSearch = setTimeout(function(){checkTimer(query)}, 100);
    } else {
      searching = true;
      setTimeout(function(){searching=false;}, 400);
      lastSearched = query;
      runSearch(query);
    }
  }

  // this periodically checks for new input
  function checkTimer(newQuery){
    if (searching){
      pendingSearch = setTimeout(function(){checkTimer(newQuery)}, 100);
    } else {
      searching = true;
      setTimeout(function(){searching=false;}, 400);
      lastSearched = newQuery;
      // kill search if user has cleared the search field
      if (settings.searchInput.val().length > 1){
        runSearch(newQuery);
      }
    }
  }


  // routing function
  function runSearch(query){
    objectsQuery = query;
    objectsOffset = 0;
    objectsRetrieved = 0;
    // show spinner, but only if search hasn't returned within 100 ms
    if (!settings.isDefault){
      showSpinner = setTimeout(function(){
        settings.searchInput.siblings('.glyphicon-refresh').show();
      }, 400);
    }
    if (settings.type == 'quotes'){
      makeQuotesQuery(objectsQuery);
    } else if (settings.type == 'authors'){
      makeAuthorsQuery(objectsQuery);
    } else if (settings.type == 'works'){
      makeWorksQuery(objectsQuery);
    }
  }

  searchDiv.on('search', function(){
    var query = settings.searchFunction();
    queueSearch(query);
  });

  searchDiv.on('sleep', function(){
    if (settings.isAdvanced){
      settings.advancedSearchButton.off('click');
    } else {
      settings.searchInput.off('input');
    }
    window.clearInterval(searchInterval);
    settings.searchInput.siblings('.glyphicon-refresh').hide();
    clearTimeout(showSpinner);
  });

  searchDiv.on('wake', function(){
    handleSearchInput(settings.searchInput)();
  });

  function updateCountBadge(count){
    if (count !== undefined){
      countBadge.text(count);
      return true;
    }
    var currentCount = '';
    if (!settings.isDefault){
      if (moreObjectsExist){
        currentCount = (objectsRetrieved+1) + '+';
      } else {
        currentCount = objectsRetrieved;
      }
    }
    countBadge.text(currentCount);
    return true;
  }

  // this initiates everything
  if (settings.isDefault){
   if (settings.searchOnLoad){
      searchDiv.trigger('search'); // load the default div with stuff
      searchDiv.html('<div class="text-center">' +
        '<i class="fa fa-spinner fa-2x fa-spin"></i></div>');
      searchInterval = window.setInterval(function(){
        if (lastSearched != settings.searchFunction()){
          searchDiv.trigger('search');
        }
      }, 1500);
    } else {
      // need to delay the search
      setTimeout(function(){
        searchDiv.trigger('search'); // load the default div with stuff
        searchInterval = window.setInterval(function(){
          if (lastSearched != settings.searchFunction()){
            searchDiv.trigger('search');
          }
        }, 1500);
      }, 500);
    }
  } else {
    handleSearchInput(settings.searchInput)();
  }



  function makeQuotesQuery(query){
    $.getJSON('/Pindar/api/quote_query?' + query,
      function(response) {
        if (query == settings.searchFunction()){
        if (!(settings.isDefault && settings.searchInput.val())){
          defaultDiv.hide();
          searchDiv.empty().show();
        }
        objectsStorage = []; // reset
        if (response.quotes.length > 0){
          var colWidth = parseInt(12 / settings.cols);
          for (var i=0; i<settings.cols; i++){
            searchDiv.append($('<div class="col-md-' + colWidth +
              ' column"></div>'));
          }
          var quotesArray = parseQuotes(response.quotes);
          // console.log(quotesArray.length + ' quotes');
          if (quotesArray.length == quotesAPILimit){
            quotesArray.pop();
            moreObjectsExist = true;
            objectsOffset += quotesAPILimit - 1;
          } else {
            moreObjectsExist = false;
          }
          $.each(quotesArray, function(index, value){
            objectsStorage.push(value);
            objectsRetrieved += 1;
          });
          appendQuotes();
        } else {
          searchDiv.html('<div class="col-md-12"><p>No quotes found.</p></div>');
        }
        if (!(settings.isDefault && settings.searchInput.val())){
          updateCountBadge();
        }
        settings.searchInput.siblings('.glyphicon-refresh').hide();
        clearTimeout(showSpinner);

        // highlight search terms
        if (settings.isAdvanced){
          var myHilitor = new Hilitor('search-advanced-quotes');
          myHilitor.setMatchType("open");
          myHilitor.apply($('#textQuery').val());
        } else {
          var myHilitor = new Hilitor('search-quotes');
          myHilitor.setMatchType("open");
          myHilitor.apply($('#textQuery').val());
        }
      }
    });

  }

  function makeAuthorsQuery(query){
    $.getJSON('/Pindar/api/author_query?' + query,
      function(response) {
      if (query == settings.searchFunction()){
      if (!(settings.isDefault && settings.searchInput.val())){
        defaultDiv.hide();
        searchDiv.empty().show();
      }
      objectsStorage = []; // reset
      if (response.authors.length > 0){
        var authorsArray = parseAuthors(response.authors, true, authorsAPILimit);
        if (authorsArray.length == authorsAPILimit){
          authorsArray.pop();
          moreObjectsExist = true;
          objectsOffset += authorsAPILimit - 1;
        } else {
          moreObjectsExist = false;
        }
        $.each(authorsArray, function(index, value){
          objectsStorage.push(value);
          objectsRetrieved += 1;
        });
        searchDiv.append('<div class="col-md-12 list-group"></div>');
        appendAuthors();
      } else {
        searchDiv.html('<div class="col-md-12"><p>No authors found.</p></div>');
      }
      if (!(settings.isDefault && settings.searchInput.val())){
        updateCountBadge();
      }
      settings.searchInput.siblings('.glyphicon-refresh').hide();
      clearTimeout(showSpinner);
      }
    });
  }


  function makeWorksQuery(query){
    $.getJSON('/Pindar/api/work_query?' + query,
      function(response) {
      if (query == settings.searchFunction()){
      if (!(settings.isDefault && settings.searchInput.val())){
        defaultDiv.hide();
        searchDiv.empty().show();
      }
      objectsStorage = []; // reset
      if (response.works.length > 0){
        var worksArray = parseWorks(response.works, true, settings.showAuthor,
          worksAPILimit);
        if (worksArray.length == worksAPILimit){
          worksArray.pop();
          moreObjectsExist = true;
          objectsOffset += worksAPILimit - 1;
        } else {
          moreObjectsExist = false;
        }
        $.each(worksArray, function(index, value){
          objectsStorage.push(value);
          objectsRetrieved += 1;
        });
        searchDiv.append('<div class="col-md-12 list-group"></div>');
        appendWorks();
      } else {
        searchDiv.html('<div class="col-md-12"><p>No works found.</p></div>');
      }
      if (!(settings.isDefault && settings.searchInput.val())){
        updateCountBadge();
      }
      settings.searchInput.siblings('.glyphicon-refresh').hide();
      clearTimeout(showSpinner);
      }
    });
  }



  function appendQuotes(){
    var columns = searchDiv.find('.column');
    var minHeight = undefined;
    for (var i=0; i<settings.objectsToShow; i++){
      if (!!objectsStorage.length){
        var q = objectsStorage.shift();
        q.quotify({size: 'small'});
        // append to shortest column
        minHeight = [50000,-1];
        for (var c=0;c<columns.length;c++){
          if ($(columns[c]).height() < minHeight[0]){
            minHeight[0] = $(columns[c]).height();
            minHeight[1] = c;
          }
        }
        q.appendTo($(columns[minHeight[1]]));
        // objectsFadeQueue.push(q);
      }
    }
    // for (var q=0; q<objectsFadeQueue.length; q++){
    //   objectsFadeQueue[q].hide();
    // }
    if (settings.pagination & (!!objectsStorage.length | moreObjectsExist)){
      if (!searchDiv.find('.btn-' + settings.type + '-more').length){
        searchDiv.append(buildBtnShowMore('quotes'));
      }
    } else {
      searchDiv.find('.btn-' + settings.type + '-more').remove();
    }
  }


  function appendAuthors(){
    for (var i=0; i<settings.objectsToShow; i++){
      if (!!objectsStorage.length){
        var a = objectsStorage.shift();
        searchDiv.find('.list-group').append(a);
        // objectsFadeQueue.push(a);
        // a.hide();
      }
    }
    if (settings.pagination & (!!objectsStorage.length | moreObjectsExist)){
      if (!searchDiv.find('.btn-' + settings.type + '-more').length){
        searchDiv.append(buildBtnShowMore('authors'));
      }
    } else {
      searchDiv.find('.btn-' + settings.type + '-more').remove();
    }
  }


  function appendWorks(){
    for (var i=0; i<settings.objectsToShow; i++){
      if (!!objectsStorage.length){
        var w = objectsStorage.shift();
        searchDiv.find('.list-group').append(w);
        // objectsFadeQueue.push(w);
        // w.hide();
      }
    }
    if (settings.pagination & (!!objectsStorage.length | moreObjectsExist)){
      if (!searchDiv.find('.btn-' + settings.type + '-more').length){
        searchDiv.append(buildBtnShowMore('works'));
      }
    } else {
      searchDiv.find('.btn-' + settings.type + '-more').remove();
    }
  }

  // have objects fade in one by one
  // window.setInterval(function(){
  //   if (!!objectsFadeQueue.length){
  //     objectsFadeQueue.shift().fadeIn();
  //   }
  // }, 200);

  function showMoreObjects(){
    if (settings.type == 'quotes'){
      appendQuotes();
    } else if (settings.type == 'authors'){
      appendAuthors();
    } else if (settings.type == 'works'){
      appendWorks();
    }

    if (!!objectsStorage.length | moreObjectsExist){
      if (!searchDiv.find('.btn-' + settings.type + '-more').length){
        searchDiv.append(buildBtnShowMore(settings.type));
      }
    } else {
      searchDiv.find('.btn-' + settings.type + '-more').remove();
    }
  }


  function replenishObjects(){
    if (moreObjectsExist){
      searchDiv.find('.btn-' + settings.type + '-more').
        html('<span class="text-center"><i class="fa fa-spinner fa-spin">' +
        '</i></span>').addClass('disabled');
      if (settings.type == 'quotes'){
        $.getJSON('/Pindar/api/quote_query?' + objectsQuery +
          '&offset=' + objectsOffset, function(response) {
          var quotesArray = parseQuotes(response.quotes);
          if (quotesArray.length == quotesAPILimit){
            quotesArray.pop();
            moreObjectsExist = true;
            objectsOffset += quotesAPILimit - 1;
          } else {
            moreObjectsExist = false;
          }
          $.each(quotesArray, function(index, value){
            objectsStorage.push(value);
            objectsRetrieved += 1;
          });
          showMoreObjects();
          updateCountBadge();
          searchDiv.find('.btn-' + settings.type + '-more').
            html('Show more ' + settings.type).removeClass('disabled');
        });
      } else if (settings.type == 'authors'){
        $.getJSON('/Pindar/api/author_query?' + objectsQuery +
          '&offset=' + objectsOffset, function(response){
          var authorsArray = parseAuthors(response.authors, true,
            authorsAPILimit);
          if (authorsArray.length == authorsAPILimit){
            authorsArray.pop();
            moreObjectsExist = true;
            objectsOffset += authorsAPILimit - 1;
          } else {
            moreObjectsExist = false;
          }
          $.each(authorsArray, function(index, value){
            objectsStorage.push(value);
            objectsRetrieved += 1;
          });
          showMoreObjects();
          updateCountBadge();
          searchDiv.find('.btn-' + settings.type + '-more').
            html('Show more ' + settings.type).removeClass('disabled');
        });
      } else if (settings.type == 'works'){
        $.getJSON('/Pindar/api/work_query?' + objectsQuery +
          '&offset=' + objectsOffset, function(response){
          var worksArray = parseWorks(response.works, unwrapped=true,
            author=true, worksAPILimit);
          if (worksArray.length == worksAPILimit){
            worksArray.pop();
            moreObjectsExist = true;
            objectsOffset += worksAPILimit - 1;
          } else {
            moreObjectsExist = false;
          }
          $.each(worksArray, function(index, value){
            objectsStorage.push(value);
            objectsRetrieved += 1;
          });
          showMoreObjects();
          updateCountBadge();
          searchDiv.find('.btn-' + settings.type + '-more').
            html('Show more ' + settings.type).removeClass('disabled');
        });
      }
    } else {
      // no more objects: pass
      console.log('error: called replenishObjects on end of list');
    }
  }



  searchDiv.on('click', '.btn-' + settings.type + '-more', function(){
    if ((objectsStorage.length < settings.objectsToShow) & moreObjectsExist){
      // replenish objects
      replenishObjects();
    } else {
      showMoreObjects(settings.type);
    }
    $(this).blur();
  });


};



