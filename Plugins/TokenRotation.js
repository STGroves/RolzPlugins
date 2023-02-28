import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js"

TableUI.pane.open = function(opt) {
  if(TableUI.pane.list[opt.id])
    TableUI.pane.close(opt.id);
  TableUI.pane.list[opt.id] = opt;
  var prefs = TableUI.pane.prefs[opt.id];
  if(!isset(opt.min_w)) opt.min_w = 15;
  if(!isset(opt.min_h)) opt.min_h = 10;
  var saved_opt = DM.userdata['p_'+opt.id];
  if(saved_opt) {
    opt.x = clamp(saved_opt.x, 0, 96);
    opt.y = clamp(saved_opt.y, 0, 96);
    opt.w = clamp(saved_opt.w, 0, 100);
    opt.h = clamp(saved_opt.h, 0, 100);
  };
  if(!prefs) {
    if(!isset(opt.w)) opt.w = 25;
    if(!isset(opt.h)) opt.h = 40;
    if(!isset(opt.x)) opt.x = 10;
    if(!isset(opt.y)) opt.y = 10;
  } else {
    opt.x = prefs.x;
    opt.y = prefs.y;
    opt.w = prefs.w;
    opt.h = prefs.h;
  }
  opt.x = clamp(opt.x, 0, 96);
  opt.y = clamp(opt.y, 0, 96);
  opt.w = clamp(opt.w, 0, 100);
  opt.h = clamp(opt.h, 0, 100);
  $('#view-panes').append(TableUI.view_pane_template(opt));
  TableUI.pane._apply_coordinates(opt);
  if(opt.noclose) $('#view-'+opt.id+' .fa-window-close').remove();
  if(opt.load)
    $('#view-'+opt.id+'-content').html('loading...▮').load(opt.load, opt.callback);
}

DM.tools.tokens.edit_properties = function(id) {
  DM.selected_id = id;
  TableUI.pane.open(
    {
      id : 'tbl_prop_edit',
      title : 'Token Properties',
      x : 75,
      y : 10,
      w : 25,
      h : 60,
      load : '/table/token-prop?room_id='+WSConnection.options.room_id+'&map_id=current&token_id='+encodeURIComponent(id),
      
      callback : () => {
        let parent = document.getElementById("view-tbl_prop_edit-content")
                             .querySelector(".rot-buttons")
                             .parentElement;
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
            value: token.r,
            callback: (value) => {
              save_token({r: value});
            }
          }
        ));
      }
    }
  )
}