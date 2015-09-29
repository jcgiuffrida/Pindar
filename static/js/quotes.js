$(document).ready(function(){
  $('.object').quotify({size: 'large'});
  $('.object').trigger('clear.quotify');

  // requested options
  if (typeof(requestFlagType) != "undefined"){
    $('.object-actions .btn-flag [data-type="' + requestFlagType + '"]').
      trigger('click.quotify');
  }
  if (typeof(requestComments) != "undefined"){
    $('.object-actions .btn-comments').trigger('click.quotify');
  }

  // make sure appropriate values are included
  var selectedLanguage = $('#QUOTE-QuoteLanguageID').attr('value');
  $('#QUOTE-QuoteLanguageID option').each(function(){
    var option = $(this);
    if (option.val() == selectedLanguage) {
        option.prop('selected', true);
        return false;
    }
  });
  $('#QUOTE-IsOriginalLanguage').prop('checked', 
    $('#QUOTE-IsOriginalLanguage').val());

  $('.all-quotes').searchify({
    type: 'quotes',
    isDefault: true,
    searchFunction: function(){ return 'author=' + 
      $('.object').data('author-tr-id') + '&sort=rating'; }
  });
});


