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
    NEW_USER: "NEW_USER"
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
    if (!WSConnection.options.mappref.chatUI) {
      WSConnection.options.mappref.chatUI = {allowPlayerChoice: false, userData: {}};
      WSConnection.options.mappref.chatUI.userData[SELF] = {colour: "#418030", time: Date.now()};
      DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
    }
  }
  
  if (!WSConnection.options.mappref.chatUI.userData[SELF])
  {
    if (isGMPresent())
    {
      const userData = JSON.parse(JSON.stringify(DM.userdata));
      userData.updateTags = [MSG_UPDATE_ID, MSG_TAGS.GM_ONLY, MSG_TAGS.NEW_USER];
      userData.updateData = {colour: "#418030", time: Date.now()};
      userData.type = USER;
      DM.send(userData);
    }
  }
  
  colourObj = WSConnection.options.mappref.chatUI.userData;

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
    TableUI.addHandler("onPromptOpen", '/table/options?room_id=' + encodeURIComponent(WSConnection.options.room_id), loadColoursPage);
  });

  /*DM.data.plugins.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.addHandler("onPromptClose", '/table/options?room_id=' + encodeURIComponent(WSConnection.options.room_id), () => {
      delete WSConnection.options.mappref.updateTags;
      delete WSConnection.options.mappref.updateData;
      delete room_mapsettings.updateTags;
      delete room_mapsettings.updateData;
      delete userpref.updateTags;
      delete userpref.updateData;
    })
  })*/;

  function handleConnection(msg) {
    console.log(msg.detail.context);
  }

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
    if (WSConnection.filterMessage(msg, MSG_UPDATE_ID, false, [], [MSG_TAGS.IGNORE]))
      return;

    const data = msg.detail.mapdata;
    const from = msg.detail.from;

    if (data.type === CREATOR) {
      colourObj = data.mapsettings.chatUI.userData;
      DM.send({type: CREATOR, mapsettings: data.mapsettings, pluginData: data.pluginData, pluginDataTags: data.pluginDataTags});
      return;
    }
 
    if (data.type === USER) {
      const {user, ...colourData} = data.pluginData[MSG_UPDATE_ID];
      if (data.pluginDataTags.user.includes(MSG_TAGS.NEW_USER)) {
        colourObj[from] = colourData;

        WSConnection.options.mappref.chatUI.userData[from] = colourData;
        DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
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
    if (isGM()) {
      room_mapsettings.chatUI.userData[user] = {colour: value, time: Date.now()};
      WSConnection.addPluginCreatorTag(MSG_UPDATE_ID, MSG_TAGS.GM_ONLY);
    } else {
      WSConnection.addPluginUserData(MSG_UPDATE_ID, {user: user, colour: value, time: Date.now()});
      WSConnection.addPluginUserTag(MSG_UPDATE_ID);
    }
  }

  function loadColoursPage() {
    if (!WSConnection.options.mappref.chatUI.allowPlayerChoice && SELF !== ROOM_CREATOR)
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
            <input type="checkbox" style="flex: 0;" >
        </div>
    </div>
    <div class="prompt-section-header">Player Colours</div>
    <div id="colourSection" class="prompt-section">`;

    const colourSection = base.querySelector("#colourSection");

    for (const[key, value] of Object.entries(colourObj)) {
      const div = document.createElement("div");
      div.innerHTML = `<div class="flex-input">
      <label>${key}</label>
      <input type="color" style="height: 100%;" value="${value.colour}"/>
  </div>`;
      const input = div.querySelector("input[type=color]");
      input.onchange = () => { updateChatUI(key, input.value); }
      colourSection.appendChild(div);
    }
  }
}