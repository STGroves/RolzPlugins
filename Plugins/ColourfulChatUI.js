import WindowUtilities from "../PluginUtilities/WindowUtilities.js";

export default function() {
  const colourObj = {};

  const CREATOR = "creator_update";
  const USER = "user_update";
  const SELF = WSConnection.options.nick

  const MSG_UPDATE_ID = "chatUI";
  const MSG_TAGS = {
    IGNORE: "IGNORE",
    GM_ONLY: "GM_ONLY"
  };

  document.addEventListener("client-tbl-mapdata", handleMessage);
  document.addEventListener("svrmsg", handleConnection);

  if (WSConnection.options.room_data.creator === DM.userdata.nick) {
    if (!WSConnection.options.mappref.chatUI) {
      WSConnection.options.mappref.chatUI = {allowPlayerChoice: false, userData:{}};
      DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
    }
  }
  
  if (!!WSConnection.options.mappref.chatUI.userData[SELF])
    colourObj[SELF] = WSConnection.options.mappref.chatUI.userData[SELF].colour;
  
  const userPrefs = JSON.parse(JSON.stringify(DM.userdata));
  userPrefs.type = USER;

  DM.send(userPrefs);

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
      span.style.color = colourObj[msg.from];
      span.style.fontWeight = "bold";

      return div.innerHTML;
    };
  
  });

  if (!DM.data.plugins.contains("PluginUtilities/TableUIUtilities"))
    DM.data.plugins.load("PluginUtilities/TableUIUtilities");

  DM.data.plugins.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.addHandler("onPromptOpen", '/table/options?room_id=' + encodeURIComponent(WSConnection.options.room_id), loadColoursPage);
  });

  function handleConnection(msg) {}

  function handleMessage(msg) {
    if (!msg.detail.mapdata.updateTags ||
        msg.detail.mapdata.updateTags.includes(MSG_TAGS.IGNORE) ||
        !msg.detail.mapdata.updateTags.includes(MSG_UPDATE_ID))
      return;

    const data = msg.detail.mapdata;
    const from = msg.detail.from;
    const gm = WSConnection.options.room_data.creator;
    
    const {user, ...colourData} = data.updateData;

    if (data.type === CREATOR && SELF === gm) {
      colourObj[user] = colourData.colour;
      WSConnection.options.mappref.chatUI.userData[user] = colourData;
      DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
      return;
    }
    else if (data.type === CREATOR) {
      colourObj[SELF] = data.mapsettings.chatUI.userData[SELF].colour;
      return;
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
    const colourData = JSON.parse(JSON.stringify(DM.userdata));
    colourData.type = DM.userData.nick === WSConnection.options.room_data.creator ? CREATOR : USER;
    colourData.updateTags = [MSG_UPDATE_ID];
    colourData.updateData = {affectedUser: user, colour: value, time: Date.now()};
    DM.send(colourData);
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
      <input type="color" style="vertical-align: middle;" onchange="updateChatUI(${key}, this.value);" value="${value}"/>
  </div>`;
      colourSection.appendChild(div);
    }
  }
}