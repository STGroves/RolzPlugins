import ToolbarUtilities from "./PluginUtilities/ToolbarUtilities.js";

function DisplayLedger() {
  if (!DM.userdata.hasOwnProperty("p_plugin_ledger"))
    TableUI.pane.open({
      id : 'plugin_ledger',
      title : 'Ini. Ledger',
      x : 50,
      y : 75,
      w : 50,
      h : 25
    });
  else
    TableUI.pane.open(DM.userdata.p_ledger);

  let content = document.getElementById("view-plugin_ledger-content");
  let ledgerContent = document.getElementById("view-tbl_ledger-content");
  
  content.appendChild(ledgerContent);

  document.getElementById("view-tbl_ledger").remove();
  document.getElementById("tgb-tbl_ledger").remove();

  let tabs = document.getElementById("table-dock-tabs");

  if (tabs.childNodes.length === 0) {
    document.getElementById("table-dock-tabs").remove();
    document.getElementById("table-dock-resizer").remove();
    document.getElementById("table-dock-container").remove();
  }
}

ToolbarUtilities.createButton("table-toolbar", "ledger", "Ledger", "list-ul", DisplayLedger);

let tabs = document.getElementById("table-dock-tabs");

if (tabs.childNodes.length === 1) {
  document.getElementById("table-dock-tabs").style.display = "none";
  document.getElementById("table-dock-resizer").style.display = "none";
  document.getElementById("table-dock-container").style.display = "none";
}