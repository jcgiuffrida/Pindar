$(document).ready(function(){
  $('.anthology').hover(function(){
    $(this).addClass('hover');
  }, function(){
    $(this).removeClass('hover');
  });
  // when user clicks on anthology, go to that anthology's page
  $('.anthology').on('click', function(){
    window.location.href = '/Pindar/default/anthologies/' + $(this).data('id');
  });
  $('.anthology a').on('click', function(e){
    e.stopPropagation();
  });
});
