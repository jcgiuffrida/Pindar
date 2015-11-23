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
  // don't load recs if we already know there are none
  if ($('.quote').data('rating-count')){
    $.getJSON('/Pindar/api/recommend?q=' + $('.quote').data('id'),
      function(response) {
        recommendationsDiv.find('.spinner').remove();
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
  } else {
    recommendationsDiv.append('<div class="col-md-12"><p>No quotes found. Rate more quotes to start getting recommendations!</p></div>');
  }

  // // on click show connections button, show connections for that quote
  // $('.show-connections').on('click', '.btn-show-connections', function(){
  //   $(this).siblings('.connections-detail').fadeIn();
  //   $(this).hide();
  // });

  var connectionsDiv = $('.show-connections');
  // don't load connections if we already know there are none
  if ($('.quote').data('connections')){
    var getConnections = function(){
      $.getJSON('/Pindar/api/connections?q=' + $('.quote').data('id'),
        function(response) {
        connectionsDiv.find('.spinner').remove();
        if (response.quotes.length > 0){
          var quotesArray = parseQuotes(response.quotes);
          $.each(quotesArray, function(index, value){
            var row = $('<div class="row"><div class="col-md-1"></div>' +
              '<div class="col-md-11"></div></div>');
            var size = Math.min(response.quotes[index]['score'], 24) / 20.0 + 0.75;
            var c = $('<div class="quote-connections">' +
              '<p class="text-right"><i class="fa fa-link" ' +
              'style="font-size: ' + size + 'em"></i></p></div>');
            c.appendTo(row.find('.col-md-1'));
            var q = value;
            q.quotify({
              size: 'small'
            });
            q.appendTo(row.find('.col-md-11'));
            var connectionsDetail = $('<div class="col-md-11 ' +
              'col-md-offset-1"></div>');
            connectionsDetail.append('<button type="button" ' +
              'class="btn btn-block btn-show-connections">' +
              'Show connections (' +
              response.quotes[index]['connections'].length + ')</button>');
            var connectionsDetailList = $('<ul class="list group ' +
              'connections-detail"  style="display: none;"></ul>');
            response.quotes[index]['connections'].forEach(function(connection){
              var listItem = $('<li class="list-group-item" data-id="' +
                + connection['id'] + '">' +
                '<div class="btn-group pull-right" role="group">' +
                '<button type="button" class="btn btn-success btn-sm" ' +
                'data-toggle="tooltip" data-placement="top" ' +
                'title="Agree with this connection">' +
                '<i class="fa fa-check"></i></button>' +
                '<button type="button" class="btn btn-warning btn-sm" ' +
                'data-toggle="tooltip" data-placement="top" ' +
                'title="Disagree with this connection">' +
                '<i class="fa fa-times"></i></button>' +
                '</div><h5>' + connection['Summary'] + '</h5>' + '<p>' +
                (connection['Description'] ? connection['Description'] : "") +
                '</p>' + '<p class="small text-right">Added ' +
                connection['AddedOn'] + ' by <a href="/Pindar/default/users/' +
                connection['AddedBy'] + '"</a>' + connection['AddedBy'] + '</p>');
              connectionsDetailList.append(listItem);
            });
            connectionsDetail.append(connectionsDetailList);
            connectionsDiv.append(row);
            connectionsDiv.append(connectionsDetail);
          });
          // initialize tooltips
          $(function() {
            $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
          });

          // initialize rating buttons
          $('.connections-detail .btn-group').on('click', 'button', function(){
            if ($(this).hasClass('btn-success')){
              var vote = 1;
              var classToAdd = 'list-group-item-success';
            } else {
              var vote = -1;
              var classToAdd = 'list-group-item-warning';
            }
            $(this).closest('li').addClass(classToAdd);
            $(this).closest('.btn-group').fadeOut();
            if ($(this).hasClass('btn-warning')){
              $(this).closest('li').delay(500).fadeOut();
            }
            $.getJSON('/Pindar/api/rate_connection?id=' +
              $(this).closest('li').data('id') + '&change=' +
              vote, function(response){
              // don't need to return anything to user
            });
          });
        }
      });
    };
    getConnections();
  } else {
    connectionsDiv.find('.spinner').remove();
    connectionsDiv.append('<div class="col-md-12"><br/><p>' +
            'No connected quotes found.<br><br>Link some yourself! ' +
            'Does this quote remind you of anything else? Click &ldquo;Connect a Quote&rdquo; above to start connecting quotes.</p></div>');
  }

  // search for quotes to connect
  $('.btn-connections').on('click', function(){
    // clicking this button will toggle between showing connections
    // and showing the search box to add more connections
    $(this).toggleClass('search');
    $('.connections .search-box').toggle();
    $('.connections .description-search').toggle();
    $('.connections .description-show').toggle();
    $('.connections .show-connections').toggle();
    $('.connections .search-connections').toggle();
    if ($(this).hasClass('search')){
      $(this).html('<i class="fa fa-chain"></i> See Connections');
      if (!user){
        var current = window.location;
        window.location.href = "/Pindar/default/user/login?_next=" + current;
      }
      $('#textQuery').focus();
    } else {
      $(this).html('<i class="fa fa-chain"></i> Connect a Quote');
    }
  });

  // searchify the text box
  $('.connections .search-connections').searchify({
    searchFunction: function(){
      return 'lookup=' + cleanSearchInput($('#textQuery').val()) +
      '&exclude=' + $('.quote').data('id');
    },
    cols: 1,
    highlightTerms: true,
    onReturn: function enableConnections(object){
      var panel = object.find('.panel');
      object.find('.text').unwrap('a');
      object.hover(function(){
        panel.css('background', '#fff url("/Pindar/static/images/connection.png")');
        panel.css('border', '3px solid #999');
        panel.find('.panel-body').css('padding', '13px')
      }, function(){
        panel.css('background', '#fff');
        panel.css('border', '1px solid #ddd');
        panel.find('.panel-body').css('padding', '15px')
      });
    }
  });

  // create modal for connections
  $('.search-connections').on('click', '.panel', function(){
    // transfer data to the modal
    var quote1 = {
      'text': $('.quote .lead').html(),
      'author': String($('.quote .btn').eq(0).text()).trim(),
      'work': String($('.quote .btn').eq(1).text()).trim(),
      'id': $('.quote').data('id'),
      'creator': $('.quote').data('creator')
    };
    // remove highlighting
    var text2 = $(this).find('.text');
    text2.find('em').each(function(index){
      $(this).replaceWith($(this).html());
    });
    var author2 = $(this).find('.btn-sm').eq(0);
    var work2 = $(this).find('.btn-sm').eq(1);
    author2.find('em').each(function(index){
      $(this).replaceWith($(this).html());
    });
    work2.find('em').each(function(index){
      $(this).replaceWith($(this).html());
    });
    var quote2 = {
      'text': text2.html(),
      'author': String(author2.text()).trim(),
      'work': String(work2.text()).trim(),
      'id': $(this).closest('.object').data('id'),
      'creator': $(this).closest('.object').data('creator')
    }
    $('#connectionModal .quote1 .text').html(quote1.text);
    if (quote1.work=='Attributed'){
      $('#connectionModal .quote1 .source').html('Attributed to ' +
        quote1.author);
    } else {
      $('#connectionModal .quote1 .source').html('From <i>' +
        quote1.work + '</i> by ' + quote1.author);
    }
    $('#connectionModal .quote2 .text').html(quote2.text);
    if (quote2.work=='Attributed'){
      $('#connectionModal .quote2 .source').html('Attributed to ' +
        quote2.author);
    } else {
      $('#connectionModal .quote2 .source').html('From <i>' +
        quote2.work + '</i> by ' + quote2.author);
    }
    $('#connectionModal .quote1').data('id', quote1.id);
    $('#connectionModal .quote2').data('id', quote2.id);
    var strength = 1;

    if (parseInt(quote1.creator)==user){
      strength += 3;
    }
    if (parseInt(quote2.creator)==user){
      strength += 3;
    }
    $('#connectionModal').data('strength', strength);
    // fill in options
    $('#connectionModal .list-group').empty();
    // if same author...
    if (quote1.author === quote2.author){
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">' + quote1.author + ' is talking about the same theme in both quotes</a>');
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">' + quote1.author + ' is alluding to a previous work</a>');
    } else {
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">' + quote1.author + ' is alluding to ' + quote2.author + '</a>');
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">' + quote2.author + ' is alluding to ' + quote1.author + '</a>');
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">Both ' + quote1.author + ' and ' + quote2.author + ' are responding to a common influence</a>');
      $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">Both ' + quote1.author + ' and ' + quote2.author + ' are talking about the same topic</a>');
    }
    $('#connectionModal .list-group').append('<a href="#" ' +
        'class="list-group-item">Something else...</a>');


    $('#connectionModal').modal('show');
  });

  // when an option is selected, fill in summary field
  $('#connectionModal').on('click', '.list-group-item', function(e){
    e.preventDefault();
    $('#connectionModal .list-group-item').removeClass('active');
    $(this).addClass('active');
    $('#connectionModal #Summary').val($(this).text()).trigger('input').focus().select();
  });

  // when both fields are filled, enable submit button
  $('#connectionModal #Summary').on('input', function(){
    if ($(this).val().length >= 5 &&
      $('#connectionModal #Description').val().length >= 5){
      $('#connectionModal .btn-submit').removeClass('disabled');
    } else {
      $('#connectionModal .btn-submit').addClass('disabled');
    }
  });
  $('#connectionModal #Description').on('input', function(){
    if ($(this).val().length >= 5 &&
      $('#connectionModal #Summary').val().length >= 5){
      $('#connectionModal .btn-submit').removeClass('disabled');
    } else {
      $('#connectionModal .btn-submit').addClass('disabled');
    }
  });

  // create connection
  $('#connectionModal').on('click', '.btn-submit', function(){
    $(this).addClass('disabled').html('<i class="fa fa-spinner fa-spin"></i>' +
      ' Create Connection');
    $.getJSON('/Pindar/api/connect?Quote1=' +
      $('#connectionModal .quote1').data('id') + '&Quote2=' +
      $('#connectionModal .quote2').data('id') + '&Summary=' +
      $('#connectionModal #Summary').val() + '&Description=' +
      $('#connectionModal #Description').val() + '&Strength=' +
      $('#connectionModal').data('strength'), function(response){
      $('.flash.alert').html('Created a new connection to this quote:' +
        '<br/>&ldquo;' + $('#connectionModal #Summary').val() +
        '&rdquo;<span id="closeflash" class="pull-right"><b> × </b></span>').slideDown();$('#connectionModal #Summary').val('');
      $('#connectionModal #Description').val('');
      $('#connectionModal').modal('hide');
      $('#connectionModal .btn-submit').html('Create Connection');
      $('.btn-connections').trigger('click');
      getConnections();
    });


  });


});


