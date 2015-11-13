$(document).ready(function(){


  // update when work type is changed
  $('#WORK-Type').on('change', function(){
    reflectTypeChange($('.edit-form'), 'work',
      $('#WORK-Type option:selected').text());
  });

  // make sure correct work type is filled in
  var selectedType = $('#WORK-Type').attr('value');
  $('#WORK-Type option').each(function(){
    var option = $(this);
    if (option.val() == selectedType) {
        option.prop('selected', true);
        return false;
    }
  });
  $('#WORK-Type').trigger('change');



  $('.object').quotify({objectType: 'work', size: 'large'});

  var defaultFunction = function(){ return ''; };
  $('.search-works').searchify({type: 'works'});
  $('.show-works').searchify({
    type: 'works',
    isDefault: true,
    searchFunction: defaultFunction,
    data: (typeof init_works !== 'undefined' ? init_works : null)
  });

  $('.quotes-by-work').searchify({
    type: 'quotes',
    isDefault: true,
    cols: 2,
    searchInput: null,
    objectsToShow: 10,
    searchFunction: function(){
      return 'work=' + $('.object').data('work-tr-id') +
        '&sort=' + $('#sortOrder').val();
    }
  });

  // on changing sort order, trigger search
  $('#sortOrder').on('change', function(){
    $('.quotes-by-work').trigger('search');
  });

});

