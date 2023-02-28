TableUI.dock.toggle = function(id) {
  $('#view-'+id).toggle();
  if($('#tgb-'+id).hasClass('inactive'))
    $('#tgb-'+id).removeClass('inactive');
  else
    $('#tgb-'+id).addClass('inactive');

  const list = document.getElementById("table-dock-tabs").children;
  const allEqual = list.every((value) => value.classList.contains("inactive") === true);

  if (allEqual) {
    document.getElementById("table-dock-tabs").style.bottom = 0;
    document.getElementById("table-dock-container").style.display = "none";
    document.getElementById("table-dock-resizer").style.display = "none";
  } else {
    document.getElementById("table-dock-tabs").style.bottom = undefined;
    document.getElementById("table-dock-container").style.display = undefined;
    document.getElementById("table-dock-resizer").style.display = undefined;
  }
}