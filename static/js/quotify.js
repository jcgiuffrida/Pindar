/*

quotify takes a quotes, authors, or works object output by one of
the tools.js 'Parse' functions and turns it into a fully functioning object.

*/



$.fn.quotify = function(options){

  var settings = $.extend({
    size: 'small',
    auth: !!user,
    objectType: 'quote'
  }, options);

  /********************
          ELEMENT CONSTRUCTORS
  ********************/

  var constructBtnEditElement = function(editCount){
    var element = '<div class="btn-group">' +
      '<button class="btn btn-default btn-edit">Edit</button>' +
      '<button type="button" class="btn btn-default dropdown-toggle"' +
      'data-toggle="dropdown"><span class="caret"></span></button>' +
      '<ul class="dropdown-menu" role="menu">' +
      '<li><a href="#" class="btn-edit-history">' +
      'See past changes';
      if (editCount > 0){
        element += ' <span class="badge">' + editCount + '</span>';
      }
      element += '</a></li></ul></div>';
    return $(element); };

  var constructBtnFlagElement = function(type, size){
    if (size == 'large'){
      var element = '<div class="btn-group btn-flag">' +
        '<button type="button" class="btn btn-default dropdown-toggle" ' +
        'data-toggle="dropdown"><i class="fa fa-flag"></i> ' +
        '<i class="fa fa-caret-down"></i></button>';
    } else {
      var element = '<div class="btn-group btn-goto-flag">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<i class="fa fa-flag"></i></a>';
    }
    element += '<ul class="dropdown-menu" role="menu">' +
      '<li><a href="#" class="flag" data-type="1">' +
      'This ' + type + ' is offensive</a></li>' +
      '<li><a href="#" class="flag" data-type="2">' +
      'This ' + type + ' is not correct</a></li>' +
      '<li><a href="#" class="flag" data-type="3">' +
      'This ' + type + ' is a duplicate</a></li>' +
      '<li><a href="#" class="flag" data-type="4">' +
      'Something else...</a></li></ul></div>';
    return $(element); };

  var constructRateElement = function(type, size){
    var element = '<div class="sum-ratings ';
    if (type == 'quote'){
      element += 'pull-left ' + size + '"><div class="ratings-box">' +
      '<div class="star-ratings-user">' +
      '<span data-star="5" class="star"></span>' +
      '<span data-star="4" class="star"></span>' +
      '<span data-star="3" class="star"></span>' +
      '<span data-star="2" class="star"></span>' +
      '<span data-star="1" class="star"></span></div>';
    } else {
      element += 'pull-right ' + size + '"><div class="ratings-box">';
    }
    element += '<div class="star-ratings-current">' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span></div>' +
      '<div class="star-ratings-base">' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span>' +
      '<span class="star"></span></div></div>' +
      '<div class="ratings-count"></div></div>';
    return $(element); };

  var constructBtnCommentsElement = function(size, commentCount){
    if(typeof(commentCount)==='undefined') commentCount = 0;
    if (size == 'large'){
      var element = '<button type="button" class="btn btn-default btn-comments">'+
        '<i class="fa fa-comments"></i> <span class="badge" ';
      if (commentCount == 0){
        element += 'style="display:none;"';
      }
      element += '>' + commentCount + '</span></button>';
    } else {
      if (commentCount == 0){
        var element = '<div class="btn-goto-comments"><a href="#">';  
      } else {
        var element = '<div class="btn-goto-comments positive"><a href="#">' + commentCount + ' ';
      }
      element += '<i class="fa fa-comments"></i></a></div>';
    }
    return $(element); };

  var constructBtnConnectionsElement = function(connectionsCount){
    var element = '';
    if (connectionsCount > 0){
      element += '<div class="pull-right btn-goto-connections positive"><a href="#">' + connectionsCount + ' ';
    } else {
      element += '<div class="pull-right btn-goto-connections"><a href="#">';
    }
    element += '<i class="fa fa-link"></i></a></div>';
    return $(element); };

  var constructBtnAnthologiesElement = function(size, inAnth){
    if(typeof(inAnth)==='undefined') inAnth = false;
    if (size == 'large'){
      var element = '<div class="btn-group btn-anthologies pull-right">' +
        '<button type="button" class="btn btn-default dropdown-toggle" ' +
        'data-toggle="dropdown"><i class="fa fa-bookmark"></i></button>';
    } else {
      var element = '<div class="btn-group btn-anthologies pull-right">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<i class="fa fa-bookmark"></i></a>';
    }
    element += '<ul class="dropdown-menu" role="menu">' +
      '<li class="anth-label">Anthologize</li>' +
      '<li class="new-anthology"><a href="#" data-id="0">' +
      'Create a new anthology...</a></li></ul></div>';
    return $(element); };


  var constructEditHistoryElement = function(){
    var element = '<div class="row edit-history" style="display:none;">' +
      '<div class="col-md-12"></div></div>';
    return $(element); };

  var constructFlagElement = function(){
    var element = '<div class="row flag-submit" style="display:none;">' +
      '<div class="col-md-12"><form role="form"><div class="form-group">' +
      '<label for="complaint"></label>' +
      '<textarea class="form-control" id="complaint" ' +
      'placeholder="Add a comment..."></textarea></div>' +
      '<div class="form-group">' +
      '<button class="btn btn-primary submit" type="button">Submit</button> ' +
      '<button class="btn btn-default cancel" type="button">Cancel</button>' +
      '</div></form></div></div>';
    return $(element); };

  var constructCommentsElement = function(auth, type, id){
    var element = '<div class="row comments" style="display:none;">' +
      '<div class="list-group col-md-8 col-md-offset-2">';
    if (auth){
      element += '<li class="list-group-item mycomment">' +
        '<form role="form"><div class="form-group">' +
        '<textarea class="form-control" id="commentfield"' +
        'placeholder="Add your own comment..."></textarea></div>' +
        '<div class="form-group">' +
        '<button class="btn btn-primary submit" type="button">Submit</button>' +
        ' <button class="btn btn-default cancel" type="button">Cancel</button>' +
        '</div></form></li>';
    } else {
      element += '<a class="list-group-item mycomment text-center" ' +
        'href="/Pindar/default/user/login?_next=' +
        '/Pindar/default/' + type + 's/' + id + '?comments=true">' +
        'Please log in to add your own comment.</a>';
    }
    element += '</div></div>';
    return $(element); };


  this.each(function(){

    /********************
          INITIALIZE
    ********************/

    var object = $(this);

    var objectActions = object.find('.object-actions');
    var objectResults = object.find('.object-results');


    /********************
          ADD APPROPRIATE ELEMENTS
    ********************/


    objectActions.append(constructRateElement(settings.objectType,
      settings.size));
    if (settings.objectType == 'quote'){
      objectActions.append(constructBtnCommentsElement(
           settings.size, object.data('comments')));
      if (settings.size == 'large'){
        objectResults.append(constructCommentsElement(settings.auth,
          settings.objectType, object.data('id')));
      }
    }
    if (settings.auth && settings.size == 'large'){
      objectActions.append(constructBtnEditElement(object.data('edits')));
      objectResults.append(constructEditHistoryElement());
    }
    objectActions.append(constructBtnFlagElement(settings.objectType,
      settings.size));
    if (settings.size == 'large'){
      objectResults.append(constructFlagElement());
    }
    if (settings.objectType == 'quote'){
      objectActions.append(constructBtnAnthologiesElement(settings.size));
      if (settings.size == 'small'){
        objectActions.append(constructBtnConnectionsElement(
          object.data('connections')));
      }
    }


    /********************
          BASIC FUNCTIONALITY
    ********************/

    var commentAdded = false;
    var numComments = object.data('comments');
    var commentsLoaded = (numComments == 0 ? true : false);
    var flagged = false;

    // clear and hide object results
    var clear = function(){
      object.find('.object-results>div').fadeOut();
      objectResults.slideUp();
      objectActions.find('.btn').removeClass('active').
        removeClass('disabled').blur();
      if (flagged){
        objectActions.find('.btn-flag>.btn').addClass('disabled');
      }
    }

    // show object actions on mouseover (for small objects)
    if (settings.size == 'small' & settings.objectType == 'quote'){
      object.on('mouseover', function(){
        objectActions.children('div').show();
      });
      object.on('mouseleave', function(){
        // objectActions.children('div').not(objectActions.find('.positive, a.already-anthologized').closest('div')).hide();
      });
      // objectActions.children('div').not(objectActions.find('.positive, a.already-anthologized').closest('div')).hide();
    }


    // on clicking quote, take user to quote page
    // object.on('click', '.text', function(){
    //   window.location.href = '/Pindar/default/quotes/' +
    //     object.data('id');
    // });

    object.find('.text').wrap('<a class="text-link" ' +
      'href="/Pindar/default/quotes/' + object.data('id') + '"></a>');

    // handlers
    object.on('clear.quotify', clear);

    // cancel buttons
    objectResults.on('click', '.cancel', function(e){
      e.preventDefault();
      object.trigger('clear.quotify');
    });


    /********************
          EDITING
    ********************/

    var edit = function(){
      var visible = objectResults.find('.edit').is(':visible');
      object.trigger('clear.quotify');
      if (!visible){
        objectResults.find('.edit').fadeIn('fast');
        objectResults.slideDown();
        objectActions.find('.btn-edit').addClass('active');
        objectResults.find('.btn-append-edit-history').show();
      }
    };
    object.on('edit.auth', edit);

    objectActions.on('click', '.btn-edit', function(e){
      e.preventDefault();
      if (settings.auth){
        object.trigger('edit.auth');
      } else if (confirm("You must log in to do that!")){
        var current = window.location;
        window.location.href = "/Pindar/default/user/login?_next=" + current;
      }
    });

    // submit edit
    objectResults.on('click.auth', '#edit-submit', function(e){
      e.preventDefault();
      $(this).addClass('disabled');
      // add verifications here
      var call = '';
      if (settings.objectType == 'quote'){
        call = '/Pindar/api/edit_quote?' +
          'QuoteID=' + object.data('id') +
          '&Text=' + $('#QUOTE-Text').val().sanitize() +
          '&QuoteLanguageID=' + $('#QUOTE-QuoteLanguageID').val() +
          '&IsOriginalLanguage=' + $('#QUOTE-IsOriginalLanguage').val() +
          '&Note=' + $('#QUOTE-Note').val().sanitize();
      } else if (settings.objectType == 'author'){
        call = '/Pindar/api/edit_author?' +
          'AuthorId=' + object.data('author-id') +
          '&AuthorTrId=' + object.data('author-tr-id') +
          '&Type=' + $('#AUTHOR-Type').val() +
          '&FirstName=' + $('#AUTHOR_TR-FirstName').val() +
          '&MiddleName=' + $('#AUTHOR_TR-MiddleName').val() +
          '&LastName=' + $('#AUTHOR_TR-LastName').val() +
          '&DisplayName=' + $('#AUTHOR_TR-DisplayName').val() +
          '&Biography=' + $('#AUTHOR_TR-Biography').val()+
          '&WikipediaLink=' + $('#AUTHOR_TR-WikipediaLink').val() +
          '&YearBorn=' + $('#AUTHOR-YearBorn').val() +
          '&YearDied=' + $('#AUTHOR-YearDied').val();
      } else if (settings.objectType == 'work'){
        call = '/Pindar/api/edit_work?' +
          'WorkId=' + object.data('work-id') +
          '&WorkTrId=' + object.data('work-tr-id') +
          '&WorkName=' + $('#WORK_TR-WorkName').val() +
          '&Type=' + $('#WORK-Type').val() +
          '&WorkSubtitle=' + $('#WORK_TR-WorkSubtitle').val() +
          '&WorkDescription=' +
          $('#WORK_TR-WorkDescription').val() +
          '&WikipediaLink=' + $('#WORK_TR-WikipediaLink').val() +
          '&YearPublished=' + $('#WORK-YearPublished').val() +
          '&YearWritten=' + $('#WORK-YearWritten').val();
      }
      $.getJSON(call, function(response){
          location.reload();
      }).error(function(e){
        $('.edit>div').append(e.responseText);
      });
    });



    /********************
          EDIT HISTORY
    ********************/

    objectResults.find('.edit').append(
      '<div class="col-md-6 col-md-offset-3">'+
      '<a class="btn btn-default btn-block ' +
      'btn-append-edit-history">Show edit history</a></div>');

    var editHistory = function(){
      var editHistoryDiv = objectResults.find('.edit-history');
      var editHistoryDivDiv = objectResults.find('.edit-history>div');
      var visible = editHistoryDiv.is(':visible');
      var editVisible = objectResults.find('.edit').is(':visible');
      if (!editVisible & !visible){  // don't clear if only edit form shows
        object.trigger('clear.quotify');
      }
      objectResults.find('.btn-append-edit-history').hide();
      objectActions.find('.btn-edit-history').
        closest('.btn-group').find('.dropdown-toggle').addClass('disabled');
      editHistoryDiv.fadeIn('fast');
      objectResults.slideDown();
      editHistoryDivDiv.html('<span><i class="fa fa-spinner ' +
          'fa-spin"></i></span>');
      $.getJSON('/Pindar/api/get_edit_history?' +
        settings.objectType.capitalize() + 'ID=' + object.data('id'),
        function(response){
          var table = '<table>';
          table += '<thead><tr><th>Field</th><th>Prior Value</th><th></th>' + 
            '<th>New Value</th><th>User</th><th>Modified</th></tr></thead>';
          var row = '';
          var newFieldNames = {
            'DisplayName': 'Display Name',
            'FirstName': 'First Name',
            'MiddleName': 'Middle Name',
            'LastName': 'Last Name',
            'WikipediaLink': 'Wikipedia',
            'WorkName': 'Name',
            'WorkSubtitle': 'Subtitle',
            'WorkDescription': 'Description',
            'WorkNote': 'Note',
            'YearBorn': 'Born',
            'YearDied': 'Died',
            'YearPublished': 'Published',
            'YearWritten': 'Written'
          };
          response.history.forEach(function(h){
            // fix values
            if (h.before === '' || h.before === 'null'){
              h.before = '<em>(blank)</em>';
            }
            if (h.after === '' || h.after === 'null'){
              h.after = '<em>(blank)</em>';
            }
            if (h.change in newFieldNames){
              h.change = newFieldNames[h.change];
            }
            row = '<tr>';
            row += '<td><strong>' + h.change + '</strong></td>';
            row += '<td>' + h.before + '</td>';
            row += '<td><i class="fa fa-arrow-right"></i></td>';
            row += '<td>' + h.after + '</td>';
            row += '<td><a href="/Pindar/default/users/' + h.user + '">' + 
              h.user + '</a></td>';
            row += '<td>' + h.timestamp + '</td>';
            row += '</tr>';
            table += row;
          });

          table += '</tbody></table>';
          table += '<div class="form-group col-md-2">' +
            '<button class="btn btn-default cancel" type="button">' +
                'Done</button></div>';
          editHistoryDivDiv.html(table);
          $('.edit-history table').DataTable({
            "dom": '<t>ip',
            "ordering": false,
            "iDisplayLength": 5,
            "language": {
              "emptyTable": "This " + settings.objectType + 
                " has never been changed."
            }
          });
          editHistoryDivDiv.find('table').addClass('stripe row-border');
      }).error(function(e){
        editHistoryDivDiv.html(e.responseText);
      });
    };
    object.on('editHistory.auth', editHistory);

    objectActions.on('click.quotify', '.btn-edit-history', function(e){
      e.preventDefault();
      if (!$('.edit-history').is(':visible')){
        object.trigger('editHistory.auth');
      }
    });

    objectResults.on('click', '.btn-append-edit-history', function(e){
      e.preventDefault();
      object.trigger('editHistory.auth');
    })


    /********************
          FLAGGING
    ********************/

    var flag = function(){
      var visible = objectResults.find('.flag-submit').is(':visible');
      object.trigger('clear.quotify');
      if (!visible){
        objectResults.find('.flag-submit').fadeIn('fast');
        objectResults.slideDown();
        objectActions.find('.btn-flag button').addClass('disabled');
      }
    };
    object.on('flag.quotify', flag);

    objectActions.on('click.quotify', '.btn-flag ul a', function(e){
      e.preventDefault();
      var selection = $(this);
      var type = $(this).data('type');
      var label = '';
      if (type == 1){
        label = 'What is offensive about this ' + settings.objectType + '?';
      } else if (type == 2){
        label = 'What is incorrect about this ' + settings.objectType + '?';
      } else if (type == 3){
        label = 'Of what ' + settings.objectType + ' is this a duplicate?';
      } else if (type == 4){
        label = 'What is wrong with this ' + settings.objectType + '?';
      }
      label += ' (Optional)';
      // show space for comment
      objectResults.find('.flag-submit').data('type', type).
        find('label').text(label);
      object.trigger('flag.quotify');
    });

    // go to object page with flag open
    objectActions.on('click.quotify', '.btn-goto-flag ul a', function(e){
      e.preventDefault();
      window.location.href = '/Pindar/default/' + settings.objectType +
        's/' + object.data('id') + '?flagType=' + $(this).data('type');
    })

    // submit a flag
    object.find('.flag-submit').on('click', '.submit', function(e){
      e.preventDefault();
      var form = $(this).closest('.flag-submit');
      var button = object.find('.btn-flag>.btn');
      var call = '/Pindar/api/flag?Type=' + form.data('type') + '&FlagNote=' +
        form.find('textarea').val() + '&' +
        settings.objectType.capitalize() + 'ID=' + object.data('id');
      $.getJSON('/Pindar/api/flag?Type=' + form.data('type') + '&FlagNote=' +
        form.find('textarea').val() + '&' +
        settings.objectType.capitalize() + 'ID=' + object.data('id'),
        function(response) {
          button.removeClass('btn-default').addClass('btn-danger').
            html('<i class="fa fa-flag"></i>');
          button.closest('.btn-flag').attr('title', 'You flagged this ' +
            settings.objectType);
      }).error(function(e){
        console.log(e.responseText);
        button.html('<i class="fa fa-flag"></i> ' +
          '<i class="fa fa-exclamation-circle"></i>').
          removeClass('btn-default').addClass('btn-warning');
      });
      object.off('flag.quotify');
      flagged = true;
      object.trigger('clear.quotify');
      button.html('<i class="fa fa-circle-o-notch fa-spin"></i> ' +
        '<i class="fa fa-caret-down"></i>');
    });


    /********************
          COMMENTING
    ********************/

    // load comments
    object.on('loadComments.quotify', function(){
      var visible = objectResults.find('.comments').is(':visible');
      object.trigger('clear.quotify');
      if (!visible){
        var comments = $('.comments .list-group');
        objectResults.find('.comments').fadeIn('fast');
        objectResults.slideDown();
        objectActions.find('.btn-comments').addClass('active');
        if (!commentsLoaded){
          $('<li class="list-group-item">' +
            '<p class="text-center"><i class="fa fa-spinner fa-spin"></i>' +
            '</p></li>').appendTo(comments);
          $.getJSON('/Pindar/api/get_comments?QuoteID=' + object.data('id'),
            function(response) {
            for (q in response.comments){
              c = response.comments[q];
              comment = $('<li class="list-group-item"><p>' + c.text +
                '</p><p class="small"><a href="/Pindar/default/users/' +
                c.user + '">' + c.user + '</a>, ' + c.timestamp +
                '</p></li>');
              comments.append(comment);
            }
            comments.find('.list-group-item').eq(1).remove();
            commentsLoaded = true;
          });
        }
      }
    });

    objectActions.on('click.quotify', '.btn-comments', function(e){
      e.preventDefault();
      object.trigger('loadComments.quotify');
    });

    // go to object page with comments open
    objectActions.on('click.quotify', '.btn-goto-comments>a', function(e){
      e.preventDefault();
      window.location.href = '/Pindar/default/' + settings.objectType +
        's/' + object.data('id') + '?comments=true';
    });

    // submit a comment
    objectResults.on('click', '.mycomment .submit', function(e){
      e.preventDefault();
      if (!settings.auth){
        if (confirm("You must log in to do that!")){
          var current = window.location;
          window.location.href = "/Pindar/default/user/login?_next=" + current;
        }
      } else {
        var text = $(this).closest('.mycomment').find('textarea').val().
          replace('\n', '<br>');
        var button = objectActions.find('.btn-comments');
        var submitButton = $(this);
        submitButton.html('<i class="fa fa-spinner fa-spin"></i> ' +
          'Working...');
        $.getJSON('/Pindar/api/comment?Text=' + text + '&QuoteID=' +
          object.data('id'), function(response) {
          var c = response.mycomment;
          comment = '<li class="list-group-item"><p>' + c.text + '</p>';
          comment += '<p class="small"><a href="/Pindar/default/users/' +
            c.user + '">' + c.user + '</a>, ' + c.timestamp + '</p></li>';
          object.find('.mycomment').hide();
          object.find('.comments .list-group').prepend(comment).show();
          numComments += 1;
          button.find('span').html(numComments).show();
          commentAdded = true;
        });
      }
    })


    /********************
          RATING
    ********************/

    objectActions.find('.ratings-box').on('mouseenter', function(){
      $(this).find('.star-ratings-user').css('z-index', '2');
    });
    objectActions.find('.ratings-box').on('mouseleave', function(){
      $(this).find('.star-ratings-user').css('z-index', '-1');
    });

    // show current rating
    var updateSumRating = function(newRating, newCount){
      var ratingAsWidth = newRating / 0.05;
      objectActions.find('.star-ratings-current').css('width', ratingAsWidth + '%');
      if (settings.objectType == 'author' | settings.objectType == 'work'){
        objectActions.find('.sum-ratings').attr('title', 'Average rating: ' +
          parseFloat(newRating).toFixed(3) + ', based on ' + newCount +
          ' rating' + plural(newCount));
      }
      if (settings.size == 'large'){
        objectActions.find('.ratings-count').html(newCount);
      }
      if (settings.objectType == 'quote'){
        if (object.data('rating-user')){
          // pass
        }
      }
    };
    updateSumRating(object.data('rating'), object.data('rating-count'));

    // update user rating
    var updateUserRating = function(rating){
      objectActions.find('.star-ratings-user span.star').
        removeClass('starred');
      for (i = 1; i <= rating; i++){
        objectActions.find('.star-ratings-user span.star[data-star=' + i +
          ']').addClass('starred');
      }
    };
    updateUserRating(object.data('rating-user'));

    // rate
    var submitRating = function(e){
      e.preventDefault();
      if (!settings.auth){
        if (confirm("You must log in to do that!")){
          var current = window.location;
          window.location.href = "/Pindar/default/user/login?_next=" + current;
        }
      } else {
        var rating = 5 - $(this).index();
        objectActions.find('.star-ratings-user').off('.rating').
          css('cursor', 'default');
        $.getJSON('/Pindar/api/rate?Rating=' + rating +
          '&QuoteID=' + object.data('id'), function(response) {
          updateUserRating(rating);
          if (response.update){
            var newRating = (object.data('rating-count') *
              object.data('rating') - response.update + rating) /
              object.data('rating-count');
            object.data('rating', newRating);
            object.data('rating-user', rating);
          } else {
            object.data('rating-user', rating);
            var newRating = (object.data('rating-count') *
              object.data('rating') + rating) / (object.data('rating-count')+1);
            var newRatingCount = object.data('rating-count')+1;
            object.data('rating-count', newRatingCount);
            object.data('rating', newRating);
          }
          updateSumRating(object.data('rating'), object.data('rating-count'));
          objectActions.find('.star-ratings-user').on('click.rating',
            'span.star', submitRating).css('cursor', 'pointer');
        }).error(function(e){
          console.log(e.responseText);
        });
      }
    };

    objectActions.find('.star-ratings-user').on('click.rating', 'span.star',
      submitRating);



    /********************
          ANTHOLOGIZE
    ********************/

    var loadAnthologies = function(){
      clearTimeout(pendingAnths);
      if (anthsToLoad !== 0){
        var pendingAnths = setTimeout(function(){loadAnthologies()}, 100);
        return;
      }
      anthItems.forEach(function(a){
        object.find('.btn-anthologies ul li.new-anthology').before($(a));
      });

      // if this quote is anthologized, show that
      anthSelections.forEach(function(s){
        if (s.quote == object.data('id')){
          object.find('.btn-anthologies ul li a.anthology-' + s.anthology)
            .addClass('anthologized').find('.anthology-check')
              .html('<i class="fa fa-check"></i>');
          object.find('.btn-anthologies>a').addClass('already-anthologized')
            .closest('div').show();
          object.find('.btn-anthologies>button')
            .addClass('already-anthologized')
        }
      });
    };

    if (settings.objectType == 'quote'){
      // fill in user's anthologies, if logged in
      if (user !== 0){
        if (anthsToLoad == 0){
          loadAnthologies();
        } else {
          var pendingAnths = setTimeout(function(){loadAnthologies()}, 100);
        }
      }

      // if user clicks New Anthology, add the current quote too
      objectActions.find('.btn-anthologies li.new-anthology a').attr('href',
        '/Pindar/default/add_anthology?quote=' + object.data('id'));

      // if user clicks an anthology, add the quote to it
      objectActions.on('click', '.btn-anthologies ul a', function(e){
        e.preventDefault();
        if ($('.anthology').length == 0){
          // don't close dropdown (don't apply to anthology pages)
          e.stopPropagation();
        }
        var thisLink = $(this);
        var thisQuote = object.data('id');
        if ($(this).closest('li').hasClass('new-anthology')){
          window.location.href = $(this).attr('href');
          return;
        }

        // add quote to anthology
        if (!($(this).hasClass('anthologized'))){
          $(this).find('.anthology-check')
            .html('<i class="fa fa-spinner fa-spin"></i>');
          $.getJSON('/Pindar/api/anthologize?anthology=' + $(this).data('id') +
            '&quote=' + object.data('id'), function(response) {
            if (response.msg == 'quote anthologized'){
              // update count for all quotes on page
              var currentCount = thisLink.find('span.badge').text()
                .split(' ')[0];
              currentCount = Number(currentCount) + 1;
              $('.object').find('.btn-anthologies .anthology-' +
                thisLink.data('id')).find('span.badge')
                .text(currentCount + ' quote' + plural(currentCount));
              // update this quote's anthology list
              thisLink.addClass('anthologized').find('.anthology-check')
                .html('<i class="fa fa-check"></i>');
              object.find('.btn-anthologies>a').addClass('already-anthologized')
                .closest('div').show();
              object.find('.btn-anthologies>button')
                .addClass('already-anthologized')
            } else if (response.msg == 'quote already anthologized'){
              // quote already selected
              console.log(response.msg);
            } else {
              // something went wrong
              console.log(response.msg);
            }
          }).error(function(e){
            console.log(e.responseText);
          });
        } else {
          // quote already anthologized: undo it
          $(this).find('.anthology-check')
            .html('<i class="fa fa-spinner fa-spin"></i>');
          $.getJSON('/Pindar/api/anthologize?anthology=' + $(this).data('id') +
            '&quote=' + object.data('id') + '&remove=True', function(response){
            if (response.msg == 'quote un-anthologized'){
              // update count for all quotes on page
              var currentCount = thisLink.find('span.badge').text()
                .split(' ')[0];
              currentCount = Number(currentCount) - 1;
              $('.object').find('.btn-anthologies .anthology-' +
                thisLink.data('id')).find('span.badge')
                .text(currentCount + ' quote' + plural(currentCount));
              // update this quote's anthology list
              thisLink.removeClass('anthologized').find('.anthology-check')
                .html('');
              // if quote is not anthologized elsewhere, remove green
              var currentAnthologies = object.find('.btn-anthologies ' +
                'a.anthologized');
              if (currentAnthologies.length === 0){
                object.find('.btn-anthologies>a')
                  .removeClass('already-anthologized');
                object.find('.btn-anthologies>button')
                  .removeClass('already-anthologized')
              }
            } else {
              // something went wrong
              console.log(response.msg);
            }
          }).error(function(e){
            console.log(e.responseText);
          });
        }
        $(this).blur();
      });
    }


    /********************
          CONNECTIONS
    ********************/

    // go to object page when click on connections
    objectActions.on('click.quotify', '.btn-goto-connections>a', function(e){
      e.preventDefault();
      window.location.href = '/Pindar/default/' + settings.objectType +
        's/' + object.data('id') + '#connections';
    });


    /********************
          EXTRA FUNCTIONALITY
    ********************/

    // wikipedia link
    objectResults.on('click', '.wiki-link', function(){
      if ($(this).closest('.input-group').find('input').val().length > 0){
        link = $(this).closest('.input-group').find('input').val();
      } else {
        var query = '';
        if (settings.objectType == 'author'){
          query = $('#AUTHOR_TR-DisplayName').val();
        } else if (settings.objectType == 'work'){
          query = $('#WORK_TR-WorkName').val();
        }
        var link = "https://en.wikipedia.org/w/index.php?search=" +
          query + "&title=Special%3ASearch";
      }
      link = link.replace(' ', '%20');
      window.open(link);
    });


    // permissions
    if (!settings.auth){
      object.off('.auth');
    }

  });

};

