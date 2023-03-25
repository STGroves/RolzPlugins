export default function() {
  TableUI.pane.onOpen = {};
  TableUI.pane.onClose = {};

  TableUI.onPromptOpen = {};
  TableUI.onPromptClose = {};

  TableUI.pane.addHandler = function(type, id, callback) {
    const actualType = type.toLowerCase();

    switch (actualType) {
      case "open":
        if (!TableUI.pane.onOpen.hasOwnProperty(id))
          TableUI.pane.onOpen[id] = [];

        TableUI.pane.onOpen[id].push(callback);
        break;
      
      case "close":
        if (!TableUI.pane.onClose.hasOwnProperty(id))
          TableUI.pane.onClose[id] = [];

        TableUI.pane.onClose[id].push(callback);
        break;
    }
  }

  TableUI.addHandler = function(type, url, callback) {
    const actualType = type.toLowerCase();

    switch (actualType) {
      case "promptopen":
        if (!TableUI.onPromptOpen.hasOwnProperty(url))
          TableUI.onPromptOpen[url] = [];

        TableUI.onPromptOpen[url].push(callback);
        break;
      
      case "promptclose":
        if (!TableUI.onPromptClose.hasOwnProperty(url))
          TableUI.onPromptClose[url] = [];

        TableUI.onPromptClose[url].push(callback);
        break;
    }
  }

  TableUI.pane.close = function(id) {
    if(TableUI.pane.list[id]) {
      TableUI.pane.prefs[id] = TableUI.pane.list[id];
      delete TableUI.pane.list[id];
    }
    $('#view-'+id).remove();

    if (TableUI.pane.onClose.hasOwnProperty(id))
      TableUI.pane.onClose[id].forEach(callback => {
        callback();
      });
  }

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
      $('#view-'+opt.id+'-content')
      .html('loading...▮')
      .load(opt.load, () => {
        if (TableUI.pane.onOpen.hasOwnProperty(opt.id))
          TableUI.pane.onOpen[opt.id].forEach(callback => {
            callback($('#view-'+opt.id)[0]);
          });
      });
  }

  TableUI.close_prompt = function() {
		$('#prompt-window').fadeOut(250);
		$('#prompt-window-footer-text').html('');
		$('#document-shade').remove();
		$(document).off('keydown');

    if (TableUI.onPromptClose.hasOwnProperty(TableUI.currentPrompt))
      TableUI.onPromptClose[TableUI.currentPrompt].forEach(callback => {
        callback();
      });
    
    TableUI.currentPrompt = undefined;
	}

	TableUI.open_prompt = function(url) {
		TableUI.close_prompt();
		TableUI.currentPrompt = url;
		$('body').append('<div id="document-shade"></div>');
		$('#prompt-window > .content').html('loading...▮').load(url, () => {
      if (TableUI.onPromptOpen.hasOwnProperty(url))
        TableUI.onPromptOpen[url].forEach(callback => {
          callback($('#prompt-window')[0]);
        });
    });
		var doc_height = $(document).height();
		var height = doc_height*0.9;
		if(height > 1080) height = 1080;
		var top = (doc_height - height) / 2;
		var width = 640;
		if($(document).width() > 1800) width = 800;
		$('#prompt-window-save-btn')
			.css('display', 'inline-block')
			.css('min-width', '120px')
			.text('Save');
		$('#prompt-window-cancel-btn')
			.css('display', 'inline-block')
			.css('min-width', '120px')
			.text('Cancel X');
		$('#prompt-window')
			.css('width', width+'px')
			.css('top', top+'px')
			.css('height', height+'px')
			.fadeIn(250);
		$(document).on('keydown', (e) => {
			if(e.keyCode == 27) TableUI.close_prompt();
		});

    TableUI.addHandler("promptopen", url, () => {
      activate_tab_opt(document.last_usr_tab);

      save_and_close = function() {
        if (room_creator_changed != room_creator_opt.creator) {
          sendLine('/room transfer '+room_creator_opt.creator);
        }
        
        DM.userdata = userpref;
        
        DM.send(WSConnection.prepareUserSendPacket(userpref));
        DM.send(WSConnection.prepareCreatorSendPacket(room_mapsettings));
        
        if(devices_changed && Conference.is_active)
          Conference.start_stream_video();
        
          TableUI.close_prompt();
      }

      $('#prompt-window-save-btn').off().on('click', save_and_close);
    });
	}

  TableUI.toggle_prompt = function(url) {
		if(TableUI.currentPrompt !== undefined)
			TableUI.close_prompt();
		else
			TableUI.open_prompt(url);
	}

  if (!DM.data.plugins.contains("PluginUtilities/WSConnectionUtilities"))
    DM.data.plugins.load("PluginUtilities/WSConnectionUtilities");
}