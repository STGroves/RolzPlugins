import WindowUtilities from "../PluginUtilities/WindowUtilities.js";

export default function() {
  const colourObj = {};

  document.addEventListener("message", handleMessage)

  colourObj[DM.userdata.nick] = DM.userdata.custom.chatColour;
  
  const userPrefs = JSON.parse(JSON.stringify(DM.userdata));
  userPrefs.type = "user_update";

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

  function handleMessage(data) {
    const found = Object.entries(PartyList.members).find(x => x[1].nick === data.detail.from)[1];

    if ((!!data.detail.context && data.detail.context === "join") ||
      (!!data.detail.mapdata.updateType && data.detail.mapdata.updateType === "chatColour")) {
      colourObj[data.detail.from] = found.custom.chatColour;
      return;
    }
  }

  function loadColoursPage() {
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

    for (const[key, _] of Object.entries(colourObj)) {
      const div = document.createElement("div");
      div.innerHTML = `<div class="flex-input">
      <label>${key}</label>
      <input type="color" style="vertical-align: middle;" onchange="DM.userdata.custom.chatColour = this.value;
      const userdata = JSON.parse(JSON.stringify(DM.userdata));
      userdata.type = 'user_update';
      userdata.updateType = 'chatColour';
      DM.send(userdata);"/>
  </div>`;
      colourSection.appendChild(div);
    }
  }
}