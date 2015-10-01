$(document).ready(function(){
  // navbar functionality
  $('.main-page-search input').on('input', function(){
    if ($(this).val().length < 2){
      $(this).closest('.main-page-search').find('button').fadeOut();
    } else {
      $(this).closest('.main-page-search').find('button').fadeIn();
    }
  });
  $('.main-page-search').on('submit', function(e){
    e.preventDefault();
    window.location.href='/Pindar/default/show?search=' +
      $(this).closest('.main-page-search').find('input').val();
  })
});