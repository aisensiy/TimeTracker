function tabs(container) {
  $('li', $(container).children('ul')).click(function() {
    var $a = $(this).find('a');
    $a.click(function(e) {
      e.preventDefault();
    });
    $(this).closest('ul').find('a').removeClass('active');
    $a.addClass('active');
    $(container).children('div').hide();
    $($a.attr('href')).show();
  });
  $('li:eq(0)', $(container).children('ul')).click();
}
tabs($('#tabset'));