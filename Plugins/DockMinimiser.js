export default function() {
  TableUI.dock.toggle = function(id) {
    $('#view-'+id).toggle();
    if($('#tgb-'+id).hasClass('inactive'))
      $('#tgb-'+id).removeClass('inactive');
    else
      $('#tgb-'+id).addClass('inactive');

    const list = document.getElementById("table-dock-tabs").children;
    const allEqual = Array.from(list).every((value) => value.classList.contains("inactive") === true);

    if (allEqual) {
      document.getElementById("table-dock-tabs").style.bottom = 0;
      document.getElementById("table-dock-container").style.display = "none";
      document.getElementById("table-dock-resizer").style.display = "none";
    } else {
      document.getElementById("table-dock-tabs").style.bottom = "";
      document.getElementById("table-dock-container").style.display = "";
      document.getElementById("table-dock-resizer").style.display = "";
    }
  }

  console.log("1st!");
}