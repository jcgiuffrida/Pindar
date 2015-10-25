$(document).ready(function(){
  $('.object').quotify({ size: 'large' });
  $('.object').trigger('clear.quotify');

  // requested options
  if (typeof(requestFlagType) != "undefined"){
    $('.object-actions .btn-flag [data-type="' + requestFlagType + '"]').
      trigger('click.quotify');
  }
  if (typeof(requestComments) != "undefined"){
    $('.object-actions .btn-comments').trigger('click.quotify');
  }

  // make sure appropriate values are included for editing
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

  // add recommendations
  // this is a good method for just appending quotes from an arbitrary
  //   API query
  var recommendationsDiv = $('.recommendations');
  $.getJSON('/Pindar/api/recommend?q=' + $('.object').data('id'),
    function(response) {
    if (response.quotes.length > 0){
      for (var i=0; i<1; i++){
        recommendationsDiv.append($('<div class="col-md-12 column"></div>'));
      }
      var quotesArray = parseQuotes(response.quotes);
      $.each(quotesArray, function(index, value){
        var q = value;
        q.quotify({size: 'small'});
        q.appendTo(recommendationsDiv.find('.column'));
      });
    } else {
      recommendationsDiv.append('<div class="col-md-12"><p>No quotes found. Rate more quotes to start getting recommendations!</p></div>');
    }
  });

});


