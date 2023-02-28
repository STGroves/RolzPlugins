import HTMLUtilities from "./PluginUtilities/HTMLUtilities.js"

DM.tools.tokens.edit_properties = function(id) {
  new Promise((resolve) => {
    DM.selected_id = id;
    TableUI.pane.open({
      id : 'tbl_prop_edit',
      title : 'Token Properties',
      x : 75,
      y : 10,
      w : 25,
      h : 60,
      load : '/table/token-edit?room_id='+WSConnection.options.room_id+'&map_id=current&token_id='+encodeURIComponent(id),
    })
    resolve();
  }).then(x => 
    document.getElementById("view-tbl_prop_edit-content").querySelector("rot-buttons").replaceChildren(HTMLUtilities.createSlider(
    {
      id: "rotation",
      min: 0,
      max: 360,
      value: token.r,
    }
  )));
}