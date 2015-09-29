$(document).ready(function(){
  
  // fill in list of works
  
  $('.object').quotify({objectType: 'work', size: 'large'});

  var defaultFunction = function(){ return ''; };
  $('.search-works').searchify({type: 'works'});
  $('.show-works').searchify({
    type: 'works', 
    isDefault: true,
    searchFunction: defaultFunction 
  });

  $('.quotes-by-work').searchify({
    type: 'quotes',
    isDefault: true,
    cols: 2, 
    searchFunction: function(){ 
      return 'work=' + $('.object').data('work-tr-id') + 
        '&sort=' + $('#sortOrder').val();
    } 
  });
});

