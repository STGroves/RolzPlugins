import ToolbarUtilities from "./PluginUtilities/ToolbarUtilities.js";

function DisplayLedger() {
  if (!DM.userdata.hasOwnProperty("p_tbl_ledger"))
    TableUI.pane.open({
      id : 'tbl_ledger',
      title : 'Ini. Ledger',
      x : 50,
      y : 75,
      w : 50,
      h : 25,
      load : '/table/ledger?room_id='+encodeURIComponent(WSConnection.options.room_id),
    });
  else
    TableUI.pane.open(DM.userdata.p_tbl_ledger);
}

ToolbarUtilities.createButton("table-toolbar", "ledger", "Ledger", "list-ul", DisplayLedger);