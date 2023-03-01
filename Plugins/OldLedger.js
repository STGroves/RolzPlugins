import ToolbarUtilities from "../PluginUtilities/ToolbarUtilities.js";

export default function() {
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

  document.getElementById("view-tbl_ledger").remove();
  document.getElementById("tgb-tbl_ledger").remove();

  if (!!TableUI.dock.hasOwnProperty("updateDock"))
  TableUI.dock.updateDock();
}