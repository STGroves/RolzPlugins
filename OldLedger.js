import ToolbarUtilities from "./PluginUtilities/ToolbarUtilities.js";

function DisplayLedger() {
  if (!!document.getElementById("view-plugin_ledger"))
    return;

  TableUI.pane.open({
    id : 'plugin_ledger',
    title : 'Ini. Ledger',
    x : 50,
    y : 75,
    w : 50,
    h : 25,
    load : '/table/ledger?room_id='+encodeURIComponent(WSConnection.options.room_id),
  });
}

ToolbarUtilities.createButton("table-toolbar", "ledger", "Ledger", "list-ul", DisplayLedger);

let tabs = document.getElementById("table-dock-tabs");

if (tabs.childNodes.length === 1) {
  document.getElementById("table-dock-tabs").remove();
  document.getElementById("table-dock-resizer").remove();
  document.getElementById("table-dock-container").remove();
}