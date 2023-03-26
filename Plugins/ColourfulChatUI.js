import WindowUtilities from "../PluginUtilities/WindowUtilities.js";
import PartyListUtilities from "../PluginUtilities/PartyListUtilities.js";
import Utilities from "../PluginUtilities/Utilities.js";
import PluginServerHandler from "../PluginServerHandler.js";
import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js";
import PluginLoader from "../PluginLoader.js";
import GradientPresets from "../PluginUtilities/GradientPresets.js";

export default function() {
  let colourObj = {};

  const CREATOR = "creator_update";
  const USER = "user_update";

  const MSG_UPDATE_ID = "chatUI";
  const MSG_TAGS = {
    IGNORE: "IGNORE",
    NEW_USER: "NEW_USER",
    GM_SETTINGS_UPDATE: "GM_SETTINGS_UPDATE"
  };

  if (PartyListUtilities.isGM())
    document.addEventListener(PluginServerHandler.MessageIDs.CLIENT_TO_SERVER, handleMessageGM);
  else
    document.addEventListener(PluginServerHandler.MessageIDs.SERVER_TO_CLIENT, handleMessageUser);
  
  document.addEventListener("srvmsg", handleConnection);

  function initiateUser() {
    if (PartyListUtilities.isGM()) {
      if (!WSConnection.options.mappref.chatUI) {
        WSConnection.options.mappref.chatUI = {allowPlayerChoice: false, userData: {}};
        WSConnection.options.mappref.chatUI.userData[PartyListUtilities.SELF] = {css: "#418030", selection: "default", time: Date.now()};
        DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
      }
    }
    
    if (!WSConnection.options.mappref.chatUI.userData[PartyListUtilities.SELF])
    {
      if (PartyListUtilities.isGMPresent())
      {
        WSConnection.addPluginUserData(MSG_UPDATE_ID, {user: SELF, css: "#418030", selection: "default", time: Date.now()});
        WSConnection.addPluginUserTags(MSG_UPDATE_ID, MSG_TAGS.NEW_USER);
        
        DM.send(WSConnection.prepareUserSendPacket(DM.userdata));
      }
    }
  
    colourObj = WSConnection.options.mappref.chatUI.userData;
  }

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
      span.style = colourObj[msg.from].css;
      span.style.fontWeight = "bold";

      return div.innerHTML;
    };
  
  });

  if (!PluginLoader.contains("PluginUtilities/TableUIUtilities"))
    PluginLoader.load("PluginUtilities/TableUIUtilities");

  PluginLoader.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
    TableUI.addHandler("promptOpen", '/table/options?room_id=' + encodeURIComponent(WSConnection.options.room_id), loadColoursPage);
    PluginLoader.addCallbackListener("PluginUtilities/WSConnectionUtilities", () => {
      initiateUser();
    });
  });

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
    if (!WSConnection.filterMessage(msg, MSG_UPDATE_ID, false, [], [MSG_TAGS.IGNORE]))
      return;

    const data = msg.detail.mapdata;
    const from = msg.detail.from;

    if (data.type === CREATOR) {
      if (!Utilities.isEmptyObject(data.mapsettings.chatUI.userData))
        colourObj = data.mapsettings.chatUI.userData;

      WSConnection.addPluginCreatorTags(MSG_UPDATE_ID, MSG_TAGS.IGNORE);
      DM.send(WSConnection.prepareCreatorSendPacket(data.mapsettings));
      return;
    }
 
    if (data.type === USER) {
      const {user, ...colourData} = data.pluginData[MSG_UPDATE_ID].data;
      if (data.pluginData[MSG_UPDATE_ID].tags.includes(MSG_TAGS.NEW_USER)) {
        colourObj[from] = colourData;

        WSConnection.options.mappref.chatUI.userData[from] = colourData;
        DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
      }

      /**TO-DO: User update colour */
    }
  }

  function updateChatUI(user, value) {
    if (PartyListUtilities.isGM()) {
      room_mapsettings.chatUI.userData[user] = {...value, time: Date.now()};
      WSConnection.addPluginCreatorTags(MSG_UPDATE_ID, MSG_TAGS.GM_SETTINGS_UPDATE);
    } else {
      WSConnection.addPluginUserData(MSG_UPDATE_ID, {user: user, ...value, time: Date.now()});
    }
  }

  function updatePlayerChoice(value) {
    room_mapsettings.chatUI.allowPlayerChoice = value;
    WSConnection.addPluginCreatorTags(MSG_UPDATE_ID, MSG_TAGS.GM_SETTINGS_UPDATE);
  }

  function loadColoursPage() {
    if (!WSConnection.options.mappref.chatUI.allowPlayerChoice && !PartyListUtilities.isGM())
      return;
    
    const base = document.getElementById("prompt-window");
    const content = WindowUtilities.createPromptPage({
      id: "ColourfulChatUI",
      label: "Colourful Chat UI",
      baseElement: base
    });

    if (PartyListUtilities.isGM())
      renderGMPage(content);
    else
      renderUserPage(content);
  }

  function renderGMPage(content) {
    const settingsSection = WindowUtilities.createPromptSection("Settings");
    const playerColoursSection = WindowUtilities.createPromptSection("Player Colours");

    content.append(settingsSection.section, settingsSection.sectionContent);
    content.append(playerColoursSection.section, playerColoursSection.sectionContent);

    settingsSection.sectionContent.appendChild(
      WindowUtilities.createPromptCheckbox(
        "Allow Player Choice",
        WSConnection.options.mappref.chatUI.allowPlayerChoice,
        updatePlayerChoice
      )
    );
    for (const[key, value] of Object.entries(colourObj)) {
      playerColoursSection.sectionContent.appendChild(
        createColourSelection(key, value)
      );
    }
  }

  function renderUserPage(content) {
    const playerColourSection = WindowUtilities.createPromptSection("Player Colour");
    const partyColoursSection = WindowUtilities.createPromptSection("Party Colours");

    content.append(playerColourSection.section, playerColourSection.sectionContent);
    content.append(partyColoursSection.section, partyColoursSection.sectionContent);

    for (const[key, value] of Object.entries(colourObj)) {
      const input = WindowUtilities.createPromptColourInput(key, value.colour, updateChatUI);

      if (key === PartyListUtilities.SELF)
        playerColourSection.sectionContent.appendChild(input)
      else {
        input.lastElementChild.disabled = true;
        partyColoursSection.sectionContent.appendChild(input);
      }
    }
  }

  function createColourSelection(label, value) {
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, ".flexHor"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".flexHor", `
        display: flex;
        align-items: stretch;
        column-gap: 5px;
        padding: 0;
        height: 40px;
        width: 100%;
        margin: 5px 0;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, ".selectionFlex"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".selectionFlex", `
        position: relative;
        height: 100%;
        width: 100%;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, ".hideInput"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".hideInput", `
        display: none !important;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, ".tempUsernameFlex"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".tempUsernameFlex", `
        flex: 1;
        text-align: center;
        align-self: center;
        font-weight: bold;
        font-size: 24px;
        font-family: helvetica, Tahoma, Arial;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, ".tempUsername"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, ".tempUsername", `
        line-height: 0.75em;
        padding: 0;
        padding-bottom: 0.2em;
        margin: auto;
        display: block;
        width: fit-content;
        -webkit-text-fill-color: transparent;
      `);
  
    const {wrapperDiv, contentDiv} = WindowUtilities.createPromptEmptyDiv(label);
    
    const line1 = document.createElement("div");
    line1.classList.add("flexHor");
  
    const line2 = document.createElement("div");
    line2.classList.add("flexHor");
  
    contentDiv.append(line1, line2);
  
    const previewDiv = document.createElement("div");
    previewDiv.classList.add("tempUsernameFlex");
  
    const previewSpan = document.createElement("span");
    previewSpan.innerHTML = `${label} <span>|</span> ${PartyListUtilities.findUser(label).character}`;
    previewSpan.classList.add("tempUsername");

    previewSpan.updateCSS = function (css, selection) {
      previewSpan.setAttribute("style", `background: ${css}; -webkit-background-clip: text;`);
      updateChatUI(label, {css: css, selection: selection});
    };
  
    previewDiv.appendChild(previewSpan);
  
    if (value.selection === "default")
      previewSpan.updateCSS("#418030", "default");
  
    const colour = document.createElement("input");
    colour.type = "color";
    colour.style.height = "40px";
  
    colour.addEventListener("input", (event) => {
      previewSpan.updateCSS(event.target.value, "colour");
    });
  
    const gradientData = {
      handleWidth: 10,
      handleInputWidth: 50,
      editorHeight: 30,
      handleBorder: 2
    }
  
    const gradientDiv = document.createElement("div");
    line2.style.height = `${10 + (gradientData.editorHeight * 2)}px`;
    
    gradientData.parent = gradientDiv;
  
    const gradientEditor = HTMLUtilities.createGradientEditor(gradientData);
  
    gradientEditor.getHTML().addEventListener("draw", (event) => {
      previewSpan.updateCSS(event.detail, "gradient");
    });
  
    const arr = Object.keys(GradientPresets).sort();
  
    const obj = {options: {}};
  
    arr.forEach((x) => {
      obj.options[x] = Utilities.toTitleCase(x.replaceAll("_", " "));
    });
  
    obj.defaultValue = Object.keys(obj.options)[0];
    
    const presetSelect = HTMLUtilities.createSelection(obj);
    presetSelect.style.height = "40px";

    presetSelect.addEventListener("change", (event) => {
      previewSpan.updateCSS(GradientPresets[event.target.value], "preset");
    })
  
    line2.append(colour, gradientDiv, presetSelect);
  
    const elements = {
      solid: {
        html: colour,
        callback: () => {
          colour.value = value.css;
        }
      },
      gradient: {
        html: gradientDiv,
        callback: () => {
          gradientData.loadData = value.css;
        }
      },
      preset: {
        html: presetSelect,
        callback: () => {
          const flatArr = Object.entries(GradientPresets).flat();
          presetSelect.value = flatArr[flatArr.findIndex(x => x === value.css) - 1];
        }
      }
    };
  
    for (const [propKey, propValue] of Object.entries(elements)) {
      propValue.html.classList.add("selectionFlex");
  
      if (propKey === value.selection)
        propValue.callback();

      else
        propValue.html.classList.add("hideInput");
    }
  
    const colourTypeOptions = {
      options: {
        default: "Default",
        solid: "Solid",
        gradient: "Gradient",
        preset: "Preset"
      },
      defaultValue: value.selection
    };

    const colourType = HTMLUtilities.createSelection(colourTypeOptions);
    colourType.style.flex = "0.5";
    
    colourType.addEventListener("hidden", (event) => {
      if (event.detail === "default")
        return;
      
      elements[event.detail].html.classList.add("hideInput");

      if (event.detail === "gradient")
        gradientEditor.Visible = false;
    });

    colourType.addEventListener("visible", (event) => {
      if (event.detail !== "default")
        elements[event.detail].html.classList.remove("hideInput");

      let css;

      switch (event.detail) {
        case "default":
          css = "#418030";
          break;
        
        case "solid":
          css = colour.value;
          break;
        
        case "gradient":
          gradientEditor.Visible = true;
          return;
        
        case "preset":
          css = GradientPresets[presetSelect.value];
          break;
      }

      previewSpan.updateCSS(css, event.detail);
    });

    line1.append(colourType, previewDiv);
    
    colourType.dispatchEvent(new CustomEvent("visible", {detail: value.selection}));

    return wrapperDiv;
  }
}