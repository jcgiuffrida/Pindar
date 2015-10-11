$(document).ready(function(){



  // fill in list of authors (if present)


  $('.object').quotify({objectType: 'author', size: 'large'});

  var defaultFunction = function(){ return ''; };
  $('.search-authors').searchify({type: 'authors'});
  $('.show-authors').searchify({
    type: 'authors',
    isDefault: true,
    searchFunction: defaultFunction
  });
  $('.quotes-by-author').searchify({
    type: 'quotes',
    isDefault: true,
    cols: 2,
    searchFunction: function(){
      return 'author=' + $('.object').data('author-tr-id') +
        '&sort=' + $('#sortOrder').val();
    }
  });
  $('.works-by-author').searchify({
    type: 'works',
    isDefault: true,
    showAuthor: false,
    searchFunction: function(){
      return 'author=' + $('.object').data('author-tr-id');
    }
  });


});

