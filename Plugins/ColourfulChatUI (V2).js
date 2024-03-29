import WindowUtilities from "../PluginUtilities/WindowUtilities.js";

export default function() {
  let colourObj = {};

  const CREATOR = "creator_update";
  const USER = "user_update";
  const SELF = WSConnection.options.nick;
  const ROOM_CREATOR = WSConnection.options.room_data.creator;

  const MSG_UPDATE_ID = "chatUI";
  const MSG_TAGS = {
    IGNORE: "IGNORE",
    GM_ONLY: "GM_ONLY",
    NEW_USER: "NEW_USER",
    ALL: "ALL"
  };

  function isGM() {
    return ROOM_CREATOR === SELF;
  }

  function isGMPresent() {
    return Object.entries(PartyList.members).find(x => x[1].nick === WSConnection.options.room_data.creator) !== undefined;
  }

  document.addEventListener("client-tbl-mapdata", isGM() ? handleMessageGM : handleMessageUser);
  document.addEventListener("svrmsg", handleConnection);

  if (ROOM_CREATOR === SELF) {
    if (!DM.userdata.custom.chatUI) {
      DM.userdata.custom.chatUI = {};
      const data = JSON.parse(JSON.stringify(DM.userdata));
      data.type = USER;
      data.updateTags = [MSG_UPDATE_ID, MSG_TAGS.GM_ONLY, MSG_TAGS.NEW_USER];
      DM.send(data);
    }
  }
  
  colourObj[SELF] = DM.userdata.custom.chatUI.userData;

  $.each(drTemplateTypes, function(idx, elementId) {

    var hbRender = Handlebars.compile($(elementId).html());
    drTemplates[idx] = function(msg) {
      if(msg.self && document.currentNick != msg.from) {
        return;
      }
      if(document.onMessageRender) {
        return(document.onMessageRender(hbRender(processMessage(msg)), msg));
      }
      if(msg.details) {
        msg.odetails = msg.details;
        if(msg.result && msg.details.replaceAll('(', '').replaceAll(')', '').trim() == msg.result.trim()) {
          delete msg.details;
        } else {
          msg.details = '<span class="details-o">'+msg.details
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('(', '<span class="details2">')
            .replaceAll(')', '</span>')
            .replaceAll('>;<', '> <')+'</span>';
        }
      }
      if(msg.text)
        msg.text_p = msg.text.autoLink({ target: "_blank", rel: "nofollow"});

      const div = document.createElement("div");
      div.innerHTML = hbRender(processMessage(msg));

      const span = div.querySelector(".username");
        
      if (span === null)
        return div.innerHTML;
      
      if (!colourObj[msg.from] || colourObj[msg.from] === undefined)
        return div.innerHTML;

      span.classList.remove("username");
      span.style.color = colourObj[msg.from].colour;
      span.style.fontWeight = "bold";

      return div.innerHTML;
    };
  
  });

  if (!DM.data.plugins.contains("PluginUtilities/TableUIUtilities"))
    DM.data.plugins.load("PluginUtilities/TableUIUtilities");

  DM.data.plugins.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.addHandler("promptOpen", '/table/options?room_id=' + encodeURIComponent(WSConnection.options.room_id), loadColoursPage);
  });

  function handleConnection(msg) {}

  function handleMessageUser(msg) {
    const data = msg.detail.mapdata;

    if (!data.updateTags || data.updateTags.includes(MSG_TAGS.IGNORE) ||
        !data.updateTags.includes(MSG_UPDATE_ID) || data.updateTags.includes(MSG_TAGS.GM_ONLY))
    return;

    if (data.type === CREATOR) {
      colourObj = data.mapsettings.chatUI.userData;
      return;
    }
  }

  function handleMessageGM(msg) {
    const data = msg.detail.mapdata;
    const from = msg.detail.from;
 
    if (data.type === USER) {
      if (!data.updateTags ||
        data.updateTags.includes(MSG_TAGS.IGNORE) ||
        !data.updateTags.includes(MSG_UPDATE_ID))
      return;
      
      if (data.updateTags.includes(MSG_TAGS.NEW_USER) && data.updateTags.includes(MSG_TAGS.ALL)) {
        const {user, ...colourData} = data.updateData;
        colourObj[user] = colourData.colour;

        if (user === SELF) {
          DM.userdata.custom.chatUI = colourData;

          const data = JSON.parse(JSON.stringify(DM.userdata));
          data.type = USER;

          DM.send(data);
        }

      }
      else if (data.updateTags.includes(MSG_TAGS.NEW_USER)) {
        data.updateTags = [MSG_UPDATE_ID, MSG_TAGS.ALL, MSG_TAGS.NEW_USER];
        data.updateData = {user: from, colour: "#418030", time: Date.now()};
        DM.send(data);
      }
    }

    /*const found = Object.entries(PartyList.members).find(x => x[1].nick === from)[1];

    else if(!!data.detail.mapdata && !!data.detail.mapdata.updateType && data.detail.mapdata.updateType === "chatColour") {
      const {user, ...colourData} = data.detail.mapdata.updateData;

      if (user === data.detail.from) {
        const userData = data.detail.mapData;
        userData.custom.chatColour = colour;

        delete userData.updateType;
        delete userData.updateData;

        DM.send(userData);
      }
    }*/
  }

  function updateChatUI(user, value) {
    userpref.updateTags = [MSG_UPDATE_ID];
    userpref.updateData = {user: user, colour: value, time: Date.now()};
  }

  function loadColoursPage() {
    if (!WSConnection.options.mappref.chatUI.allowPlayerChoice && SELF !== WSConnection.options.room_data.creator)
      return;
    
    const base = document.getElementById("prompt-window");
    const content = WindowUtilities.createPromptPage({
      id: "ColourfulChatUI",
      label: "Colourful Chat UI",
      baseElement: base
    });

    content.innerHTML = `<div class="prompt-section-header">Settings</div>
    <div class="prompt-section">
        <div class="flex-input">
            <label>Allow Player Choice</label>
            <input type="checkbox" style="flex: 0;" id="">
        </div>
    </div>
    <div class="prompt-section-header">Player Colours</div>
    <div id="colourSection" class="prompt-section">`;

    const colourSection = base.querySelector("#colourSection");

    for (const[key, value] of Object.entries(colourObj)) {
      const div = document.createElement("div");
      div.innerHTML = `<div class="flex-input">
      <label>${key}</label>
      <input type="color" style="vertical-align: middle;" value="${value}"/>
  </div>`;
      const input = div.querySelector("input[type=color]");
      input.onchange = () => { updateChatUI(key, input.value); }
      colourSection.appendChild(div);
    }
  }
}