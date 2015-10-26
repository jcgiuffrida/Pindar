$(document).ready(function(){
  var validator = $('.add-anthology-form').validate({
    rules: {
      Name: {
        maxlength: 128,
        required: true
      },
      Description: {
        maxlength: 8192
      }
    },
    messages: {
      Name: {
        required: "Please enter a name for your anthology",
        maxlength: "Your anthology name is too long"
      },
      Description: "The description of your anthology is too long"
    },
    submitHandler: function(form) {
      $('#anthology-submit').addClass('disabled').text('Working...');
      $.getJSON('/Pindar/api/create_anthology?' +
        'Name=' + $('#ANTHOLOGY-Name').val() +
        '&Description=' + $('#ANTHOLOGY-Description').val(),
        function(response) {
          if (response.msg == 'oops'){
            $('form').append('<p class="bg-danger">Error: ' + response.msg +
            '</p>');
          } else {
            // tell reader it worked
            $('#anthology-submit').removeClass('disabled').text('Create Anthology');
            $('.flash.alert').html('Added ' + '<a href="/Pindar/default/' +
              'anthologies/' + response.id + '">new anthology</a>! ' +
              '<a href="/Pindar/default/show">Start adding some quotes</a>' +
              '<span id="closeflash"> × </span>').slideDown();
            // if user wants to add a quote, add it now
            if (typeof quote !== 'undefined'){
              $.getJSON('/Pindar/api/anthologize?anthology=' + response.id +
              '&quote=' + quote, function(response) {
                // pass
              });
            }
          }
      });
    }
  });
});