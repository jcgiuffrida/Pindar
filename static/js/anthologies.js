$(document).ready(function(){
  // functionality for follow button
  $('.follow-anthology').on('click', function(){
    if ($(this).hasClass('following')){
      // already following; unfollow
      $.getJSON('/Pindar/api/follow_anthology?anthology=' +
        $('.anthology').data('id') + '&remove=True', function(response) {
        if (response.msg == 'anthology unfollowed'){
          // update count
          var currentCount = $('.anthology-badge').text().split(' ')[0];
          currentCount = Number(currentCount) - 1;
          $('.anthology-badge').text(currentCount + ' Follower' +
            plural(currentCount));
          // update button
          $('.follow-anthology').html('Follow').removeClass('following')
            .removeClass('btn-success').addClass('btn-info');
        } else {
          // something went wrong
          console.log(response.msg);
        }
      }).error(function(e){
        console.log(e.responseText);
      });
    } else {
      // not already following; follow
      $.getJSON('/Pindar/api/follow_anthology?anthology=' +
        $('.anthology').data('id'), function(response) {
        if (response.msg == 'anthology followed'){
          // update count
          var currentCount = $('.anthology-badge').text().split(' ')[0];
          currentCount = Number(currentCount) + 1;
          $('.anthology-badge').text(currentCount + ' Follower' +
            plural(currentCount));
          // update button
          $('.follow-anthology').html('<i class="fa fa-check"></i> Following')
            .removeClass('btn-info').addClass('btn-success')
            .addClass('following');
        } else {
          // something went wrong
          console.log(response.msg);
        }
      }).error(function(e){
        console.log(e.responseText);
      });
    }
  });

  // add quotes
  $('.anthologized-quotes').searchify({
    type: 'quotes',
    isDefault: true,
    cols: 2,
    searchFunction: function(){
      return 'anthology=' + $('.anthology').data('id');
    }
  });

  // if user un-anthologizes, hide quote
  $('.anthologized-quotes').on('click', '.btn-anthologies ul a.anthologized.anthology-' + $('.anthology').data('id'), function(e){
    var currentCount = $('.quotecount').text().split(' ')[0];
    currentCount = Number(currentCount) - 1;
    $('.quotecount').html('<b>' + currentCount + ' quote' +
      plural(currentCount) + '</b>');
    $(this).closest('.object').fadeOut();
  });

});
