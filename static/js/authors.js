$(document).ready(function(){

  // update when author type is changed
  $('#AUTHOR-Type').on('change', function(){
    reflectTypeChange($('.edit-form'), 'author',
      $('#AUTHOR-Type option:selected').text());
  });

  // make sure correct author type is filled in
  var selectedType = $('#AUTHOR-Type').attr('value');
  $('#AUTHOR-Type option').each(function(){
    var option = $(this);
    if (option.val() == selectedType) {
        option.prop('selected', true);
        return false;
    }
  });
  $('#AUTHOR-Type').trigger('change');

  $('.object').quotify({objectType: 'author', size: 'large'});

  var defaultFunction = function(){ return ''; };
  $('.search-authors').searchify({
    type: 'authors'
  });
  $('.show-authors').searchify({
    type: 'authors',
    isDefault: true,
    searchFunction: defaultFunction,
    data: (typeof init_authors !== 'undefined' ? init_authors : null)
  });
  $('.quotes-by-author').searchify({
    type: 'quotes',
    isDefault: true,
    cols: 2,
    searchInput: null,
    objectsToShow: 10,
    searchFunction: function(){
      return 'author=' + $('.object').data('author-tr-id') +
        '&sort=' + $('#sortOrder').val();
    }
  });
  $('.works-by-author').searchify({
    type: 'works',
    isDefault: true,
    showAuthor: false,
    searchInput: null,
    searchFunction: function(){
      return 'author=' + $('.object').data('author-tr-id');
    }
  });

  // on changing sort order, trigger search
  $('#sortOrder').on('change', function(){
    $('.quotes-by-author').trigger('search');
  });


});

