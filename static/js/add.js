
$(document).ready(function(){
  // hide author and work fields

  var authorTable = $('.author-results .list-group');
  var authorNewItem = authorTable.find('.new-item');
  var workTable = $('.work-results .list-group');
  var workNewItem = workTable.find('.new-item');

  if (initAuthor !== ''){
    $('.author-lookup').data('author-id', initAuthor);
    $('.author-lookup input').val(initAuthorName)
    $('.author-lookup').addClass('has-success');
    $('.author-lookup .glyphicon-remove').show();
  } else {
    // $('.author-lookup').hide();
    $('.work-lookup').hide();
  }
  $('.author-results').hide();
  $('.add-author').hide();

  if (initWork !== ''){
    $('.work-lookup').data('work-id', initWork);
    if (initWorkName == 'Attributed'){
      $('.work-lookup input').val('(Attributed)');
    } else {
      $('.work-lookup input').val(initWorkName);
    }
    $('.work-lookup').addClass('has-success');
    $('.work-lookup .glyphicon-remove').show();
    $('.work-buttons').hide();
  } else {
    $('.add-quote').hide();
  }
  $('.work-results').hide();
  $('.add-work').hide();

  $('.add-form').hide().fadeIn('slow');
  $('#QUOTE-Text').focus();

  var button = '';

  /*
  var started = false;
  $('#QUOTE-Text').keyup(function(){
    if (started | $('#QUOTE-Text').val().length > 2){
      started = true;
      $('.author-lookup').fadeIn('slow');
    }
  });
*/

  // regex validation
  // what is this???
  $.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Please check your input."
  );

  // if author lookup changes, reset
  $('.author-lookup input').keyup(function(){
    // do this first for speed reasons
    var query = $(this).val();
    authorNewItem.html('<b>' + query.capitalize() +
      '</b>&nbsp;&nbsp;&nbsp;<em>Create new author</em>');
    $('.work-results').hide().find('.list-group a').not('.new-item').remove();
    $('.work-lookup').fadeOut('fast');
    $('.work-lookup input').val('');
    $('.work-lookup .glyphicon-remove').hide();
    $('.work-lookup .work-buttons').fadeIn('fast');
    $('.add-quote').fadeOut('fast');
    $('.work-lookup').data('work-id', '');
    $('.work-lookup').data('work-tr-id', '');
    $('.author-lookup').data('author-id', '');
    $('.author-lookup').data('author-tr-id', '');
    $('.author-lookup').removeClass('has-success');
    if ($('.author-lookup input').val().length < 2){
      if ($('.author-results').is(':visible')){
        $('.author-results').hide();
        $('.author-results .list-group a').not('.new-item').remove();
      }
    } else {
      $('.author-results').fadeIn('slow');
      $('.author-results .searching').
        html('<i class="fa fa-spinner fa-spin"></i>');

      $.getJSON('/Pindar/api/author_query?lookup=' + query,
        function(response) {
        $('.author-results .searching').html('');
        authorTable.detach();
        authorTable.find('a').not('.new-item').remove();
        if (response['authors'].length > 0){
        var authors = $(parseAuthors(response.authors,
          unwrapped=true));
          $(authors.get().reverse()).each(function(){
            authorTable.prepend(this);
          });
        } else {
          authorTable.prepend('<a class="list-group-item disabled">' +
            '<em>No authors found.</em></a>');
        }
        $('.author-results .row:last').append(authorTable);
      });
    }
  });

  // if work lookup changes, reset
  $('.work-lookup input').keyup(function(){
    // do this first for speed reasons
    var query = $(this).val();
    workNewItem.html('<b>' + query.capitalize() +
      '</b>&nbsp;&nbsp;&nbsp;<em>Create new work</em>');

    $('.add-quote').fadeOut('fast');
    $('.work-lookup').data('work-id', '');
    $('.work-lookup').data('work-tr-id', '');
    $('.work-lookup').removeClass('has-success');
    if ($('.work-lookup input').val().length < 2){
      if ($('.work-results').is(':visible')){
        $('.work-results').hide();
        $('.work-results .list-group a').not('.new-item').remove();
      }
      $('.work-lookup .work-buttons').fadeIn('fast');
    } else {
      $('.work-lookup .work-buttons').hide();
      var author = $('.author-lookup').data('author-id');
      $('.work-results').fadeIn('slow');
      $('.work-results .searching').
        html('<i class="fa fa-spinner fa-spin"></i>');

      $.getJSON('/Pindar/api/work_query?lookup=' + query +
        '&author=' + author, function(response) {
        $('.work-results .searching').html('');
        workTable.detach();
        workTable.find('a').not('.new-item').remove();
        if (response['works'].length > 0){
          var works = $(parseWorks(response.works,
            unwrapped=true, author=false));
          $(works.get().reverse()).each(function(){
            workTable.prepend(this);
          });
        } else {
          workTable.prepend('<a class="list-group-item disabled">' +
            '<em>No works found.</em></a>');
        }
        $('.work-results .row:last').append(workTable);
      });
    }
  });

  // if user clears author lookup while a work is being added, clear all
  $('.author-lookup').on('click', '.glyphicon-remove', function(){
    $('.add-work').fadeOut('fast');
    clear_work();
    validator.resetForm();
  });

  // button handling
  $('.add-form').on('click', 'button', function(){
    // open wikipedia link in new window or tab
    if ($(this).hasClass('wiki-link')){
      var query = $(this).closest('.form-group').parent('div').
        find('input:first').val();
      var link = "https://en.wikipedia.org/w/index.php?search=" +
        query + "&title=Special%3ASearch";
      link = link.replace(' ', '%20');
      window.open(link);
    } else if ($(this).hasClass('btn-attributed')){
      // if user clicks Attributed button, select Attributed
      $('.work-lookup .work-buttons').hide();
      // select Attributed for this author
      $.getJSON('/Pindar/api/work_query?lookup=Attributed&author=' + $('.author-lookup').data('author-id') + '&showAttributed=true', function(response){
        var attributed = response.works[0];
        $('.work-lookup').data('work-id', attributed.WORK.id);
        $('.work-lookup').data('work-tr-id', attributed.WORK_TR.id);
        $('.work-lookup input').val('(Attributed)');
        $('.work-lookup').addClass('has-success');
        $('.add-quote').fadeIn('slow');
        $('.work-lookup .glyphicon-remove').show();
      });
    } else if ($(this).hasClass('btn-show-all-works')){
      $('.work-lookup input').val('  ').trigger('keyup').trigger('input');
    } else {
      button = $(this).attr('id');
      if (button == 'quote-submit'){
        // only check that quote has text if that button is clicked
        $('#QUOTE-Text').rules('add', {
          required: true
        });
      } else {
        $('#QUOTE-Text').rules('remove');
        if (button == 'author-cancel'){
          $('.add-author').fadeOut('fast');
          $('.author-lookup').fadeIn('fast');
          $('.author-lookup input').focus().trigger('keyup');
          clear_author();
          validator.resetForm();
        } else if (button == 'work-cancel'){
          $('.add-work').fadeOut('fast');
          $('.work-lookup').fadeIn('fast');
          $('.work-lookup input').focus().trigger('keyup');
          clear_work();
          validator.resetForm();
        } else if (button == 'quote-cancel'){
          validator.resetForm();
          // clear everything???
        }
      }
    }
  });

  // validations
  var validator = $('.add-form').validate({
    rules: {
      FirstName: {
        maxlength: 128
      },
      MiddleName: {
        maxlength: 128
      },
      LastName: {
        maxlength: 128
      },
      DisplayName: {
        required: true,
        maxlength: 512
      },
      Biography: {
        maxlength: 8192
      },
      AuthorWikipediaLink: {
        regex: '^(https://|http://)?[a-z]{2}\.wikipedia\.org/wiki/.{1,}'
      },
      YearBorn: {
        range: [-5000,2050]
      },
      YearDied: {
        range: [-5000, 2050]
      },
      WorkName: {
        required: true,
        maxlength: 1024
      },
      WorkSubtitle: {
        maxlength: 1024
      },
      WorkDescription: {
        maxlength: 4096
      },
      WorkWikipediaLink: {
        regex: '^(https://|http://)?[a-z]{2}\.wikipedia\.org/wiki/.{1,}'
      },
      WorkNote: {
        maxlength: 4096
      },
      YearPublished: {
        range: [-5000, 2050]
      },
      YearWritten: {
        range: [-5000, 2050]
      },
      Text: {
        required: true,
        minlength: 3
      },
      QuoteLanguageID: {
        required: true
      },
      Note: {
        maxlength: 4096
      }
    },
    messages: {
      DisplayName: {
        required: "Please enter a name"
      },
      YearBorn: "Please enter a valid year",
      YearDied: "Please enter a valid year",
      WorkName: {
        required: "Please enter the work name"
      },
      YearPublished: "Please enter a valid year",
      YearWritten: "Please enter a valid year",
      Text: {
        required: "Please enter the quote",
        minlength: "Your quote should be more than two characters"
      },
      QuoteLanguageID: "What language is the quote in?"
    },
    submitHandler: function(form) {
      if (button == 'author-submit'){
        $('.' + button).addClass('disabled');

        $.getJSON('/Pindar/api/author_submit?' +
          'FirstName=' + $('#AUTHOR_TR-FirstName').val() +
          '&MiddleName=' + $('#AUTHOR_TR-MiddleName').val() +
          '&LastName=' + $('#AUTHOR_TR-LastName').val() +
          '&DisplayName=' + $('#AUTHOR_TR-DisplayName').val() +
          //'&AKA=' + $('#AUTHOR_TR-AKA').val() +
          '&Biography=' +
          $('#AUTHOR_TR-Biography').val().sanitize() +
          '&WikipediaLink=' + $('#AUTHOR_TR-WikipediaLink').val() +
          '&YearBorn=' + $('#AUTHOR-YearBorn').val() +
          '&YearDied=' + $('#AUTHOR-YearDied').val() +
          '&Type=' + $('#AUTHOR-Type').val(),
          function(response) {
            var authorName = $('#AUTHOR_TR-DisplayName').val();
            $('.add-author').fadeOut('fast');
            $('.author-lookup').fadeIn('fast').find('input').
              val($('#AUTHOR_TR-DisplayName').val());
            $('.author-lookup').data('author-id', response.AuthorID).
              data('author-tr-id', response.AuthorTrID);
            $('.author-lookup').addClass('has-success');
            $('.work-lookup').fadeIn('fast').find('input').focus();
            clear_author();
            $('.' + button).removeClass('disabled');
            // tell reader it worked
            $('.flash.alert').html('Added ' + authorName + ' as a new author<span id="closeflash"> × </span>')
              .slideDown();
        });
      } else if (button == 'work-submit'){
        $('.' + button).addClass('disabled');

        $.getJSON('/Pindar/api/work_submit?' +
          'WorkName=' + $('#WORK_TR-WorkName').val() +
          '&WorkSubtitle=' + $('#WORK_TR-WorkSubtitle').val() +
          '&WorkDescription=' +
          $('#WORK_TR-WorkDescription').val().sanitize() +
          '&WikipediaLink=' + $('#WORK_TR-WikipediaLink').val() +
          '&YearPublished=' + $('#WORK-YearPublished').val() +
          //'&YearWritten=' + $('#WORK-YearWritten').val() +
          '&Type=' + $('#WORK-Type').val(),
          '&AuthorID=' + $('.author-lookup').data('author-id'),
          function(response) {
            var workName = $('#WORK_TR-WorkName').val();
            $('.add-work').fadeOut('fast');
            $('.work-lookup').fadeIn('fast').find('input').
              val($('#WORK_TR-WorkName').val());
            $('.work-lookup').data('work-id', response.WorkID).
              data('work-tr-id', response.WorkTrID);
            $('.work-lookup').addClass('has-success');
            $('.add-quote').fadeIn('fast').find('textarea').focus();
            clear_work();
            $('.' + button).removeClass('disabled');
            // tell reader it worked
            $('.flash.alert').html('Added ' + workName + ' as a new work<span id="closeflash"> × </span>')
              .slideDown();
        });
      } else if (button == 'quote-submit'){
        $('.' + button).addClass('disabled');

        $.getJSON('/Pindar/api/quote_submit?' +
          'Text=' + $('#QUOTE-Text').val().sanitize() +
          '&QuoteLanguageID=' + $('#QUOTE-QuoteLanguageID').val() +
          //'&IsOriginalLanguage=' +
          //$('#QUOTE-IsOriginalLanguage').prop('checked') +
          '&Note=' + $('#QUOTE-Note').val().sanitize() +
          '&WorkID=' + $('.work-lookup').data('work-id'),
          function(response) {
            clear_quote();
            clear_author();
            clear_work();
            $('#QUOTE-Text').focus();
            $('.' + button).removeClass('disabled');
            // tell reader it worked
            $('.flash.alert').html('Quote added! <a href="/Pindar/default/quotes/' + response.QuoteID + '">View quote</a><span id="closeflash"> × </span>')
              .slideDown();
        });
      }
    }
  });

  // author and work type selections
  $('#AUTHOR-Type').on('change', function(){
    reflectTypeChange($('.add-author'), 'author',
      $('#AUTHOR-Type option:selected').text());
  });

  $('#WORK-Type').on('change', function(){
    reflectTypeChange($('.add-work'), 'work',
      $('#WORK-Type option:selected').text());
  });

});

// select the author
(function ($) {
  $.selectAuthor = function(list){
    var selected;
    $(list).on('click', ".list-group a", function(e) {
      e.preventDefault();
      selected = $(this);
      if (selected.hasClass('disabled')){
        return;
      }
      if (selected.data('author-id') == 0){
        // add a new author
        $('.author-results').fadeOut('fast').find('.list-group a').
          not('.new-item').remove();
        $('.author-lookup').fadeOut('fast');
        $('.add-author').fadeIn('fast');
        $('#AUTHOR_TR-DisplayName').val($('.author-lookup input').
          val().capitalize());
        var names = $('#AUTHOR_TR-DisplayName').val().split(" ");
        if (names.length == 2){
          $('#AUTHOR_TR-FirstName').val(names[0]);
          $('#AUTHOR_TR-LastName').val(names[1]);
        } else if (names.length == 3){
          $('#AUTHOR_TR-FirstName').val(names[0]);
          $('#AUTHOR_TR-MiddleName').val(names[1]);
          $('#AUTHOR_TR-LastName').val(names[2]);
        }
      } else {
        // select an existing author
        $('.author-lookup').data('author-id', selected.data('author-id'));
        $('.author-lookup').data('author-tr-id',
          selected.data('author-tr-id'));
        if (selected.html().indexOf('(') !== -1){
          $('.author-lookup input').val(selected.html().substring(0,
            selected.html().indexOf('(') - 1));
        } else if (selected.html().indexOf('<') !== -1){
          $('.author-lookup input').val(selected.html().substring(0,
            selected.html().indexOf('<')));
        } else {
          $('.author-lookup input').val(selected.html());
        }
        $('.author-results').fadeOut('fast').find('.list-group a').
          not('.new-item').remove();
        $('.author-lookup').addClass('has-success');
        $('.work-lookup').fadeIn('slow');
      }
    });
  }
})($);
$.selectAuthor(".author-results");

function clear_quote() {
  $('#QUOTE-Text').val('');
  $('#QUOTE-Note').val('');
}

function clear_author() {
  $('#AUTHOR_TR-FirstName').val('');
  $('#AUTHOR_TR-MiddleName').val('');
  $('#AUTHOR_TR-LastName').val('');
  $('#AUTHOR_TR-AKA').val('');
  $('#AUTHOR_TR-DisplayName').val('');
  $('#AUTHOR_TR-Biography').val('');
  $('#AUTHOR_TR-WikipediaLink').val('');
  $('#AUTHOR-YearBorn').val('');
  $('#AUTHOR-YearDied').val('');
}

function clear_work() {
  $('#WORK_TR-WorkName').val('');
  $('#WORK_TR-WorkSubtitle').val('');
  $('#WORK_TR-WorkDescription').val('');
  $('#WORK_TR-WikipediaLink').val('');
  $('#WORK-YearPublished').val('');
  $('#WORK-YearWritten').val('');
}

(function ($) {
  $.selectWork = function(list){
    var selected;
    $(list).on("click", ".list-group a", function(e) {
      e.preventDefault();
      selected = $(this);
      if (selected.hasClass('disabled')){
        return;
      }
      if (selected.data('work-id') == 0){
        // add a new work
        $('.work-results').fadeOut('fast').find('.list-group a').
          not('.new-item').remove();
        $('.work-lookup').fadeOut('fast');
        $('.add-work').fadeIn('fast');
        $('#WORK_TR-WorkName').val($('.work-lookup input').
          val().capitalize());
        var names = $('#WORK_TR-WorkName').val().split(" ");
      } else {
        // select an existing work
        $('.work-lookup').data('work-id', selected.data('work-id'));
        $('.work-lookup').data('work-tr-id', selected.data('work-tr-id'));
        if (selected.html().indexOf('(') !== -1){
          $('.work-lookup input').val(selected.html().substring(0,
            selected.html().indexOf('(') - 1));
        } else if (selected.html().indexOf('<') !== -1){
          $('.work-lookup input').val(selected.html().substring(0,
            selected.html().indexOf('<')));
        } else {
          $('.work-lookup input').val(selected.html());
        }
        $('.work-results').fadeOut('fast').find('.list-group a').
          not('.new-item').remove();
          $('.work-lookup').addClass('has-success');
        $('.add-quote').fadeIn('slow');
      }
    });
  }
})($);
$.selectWork(".work-results");

