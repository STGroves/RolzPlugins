import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js";
import PluginLoader from "../PluginLoader.js";

export default function() {
  if (!PluginLoader.contains("PluginUtilities/TableUIUtilities"))
    PluginLoader.load("PluginUtilities/TableUIUtilities");

  DM.tools.tokens.edit_properties = function(id) {
    DM.selected_id = id;
    if (!TableUI.pane.onOpen.hasOwnProperty('tbl_prop_edit') || !TableUI.pane.onOpen['tbl_prop_edit'].includes(addRotationSlider))
      TableUI.pane.addHandler("open", 'tbl_prop_edit', addRotationSlider);

    TableUI.pane.open(
      {
        id : 'tbl_prop_edit',
        title : 'Token Properties',
        x : 75,
        y : 10,
        w : 25,
        h : 60,
        load : '/table/token-prop?room_id='+WSConnection.options.room_id+'&map_id=current&token_id='+encodeURIComponent(id),
      }
    );
  }

  function addRotationSlider(elementBase) {
    let parent = elementBase.querySelector(".rot-buttons").parentElement;
    parent.innerHTML = `<div style="flex:0.2; min-width: 120px; padding:9px; padding-left: 0; position: relative">
    <label for="table-opt-show-base">Rotation</label>
    <i class="fa fa-question-circle" style="position: absolute; right: 10px; top: 50%; transform:translateY(-50%)"><div class="hint--bottom-right" aria-label="Hold SHIFT to snap to 45 degrees" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; font-weight: normal"></div></i>
</div>
<div style="position: relative">`;

    parent.lastChild.appendChild(HTMLUtilities.createSlider(
      {
        id: "rotation",
        min: 0,
        max: 360,
        value: token.r || 0,
        callback: (value) => {
          save_token({r: value});
        }
      }
    ));
  }
}