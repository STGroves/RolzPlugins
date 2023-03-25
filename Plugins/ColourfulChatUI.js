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
    document.addEventListener(PluginServerHandler.getMessageIDs().CLIENT_TO_SERVER, handleMessageGM);
  else
    document.addEventListener(PluginServerHandler.getMessageIDs().SERVER_TO_CLIENT, handleMessageUser);
  
  document.addEventListener("svrmsg", handleConnection);

  function initiateUser() {
    if (PartyListUtilities.isGM()) {
      if (!WSConnection.options.mappref.chatUI) {
        WSConnection.options.mappref.chatUI = {allowPlayerChoice: false, userData: {}};
        WSConnection.options.mappref.chatUI.userData[PartyListUtilities.SELF] = {colour: "#418030", time: Date.now()};
        DM.send({type: CREATOR, mapsettings: WSConnection.options.mappref});
      }
    }
    
    if (!WSConnection.options.mappref.chatUI.userData[PartyListUtilities.SELF])
    {
      if (PartyListUtilities.isGMPresent())
      {
        WSConnection.addPluginUserData(MSG_UPDATE_ID, {user: SELF, colour: "#418030", time: Date.now()});
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

  /*PluginLoader.addCallbackListener("PluginUtilities/TableUIUtilities", () => {
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
    if (PartyListUtilities.isGM()) {
      room_mapsettings.chatUI.userData[user] = {...value, time: Date.now()};
      WSConnection.addPluginCreatorTags(MSG_UPDATE_ID, MSG_TAGS.GM_SETTINGS_UPDATE);
    } else {
      WSConnection.addPluginUserData(MSG_UPDATE_ID, {user: user, ...value, time: Date.now()});
      //WSConnection.addPluginUserTag(MSG_UPDATE_ID);
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
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, "flexHor"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "flexHor", `
        display: flex;
        align-items: stretch;
        column-gap: 5px;
        padding: 0;
        height: 40px;
        width: 100%;
        margin: 5px 0;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, "selectionFlex"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "selectionFlex", `
        position: relative;
        height: 100%;
        width: 100%;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, "hideInput"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "hideInput", `
        display: none !important;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, "tempUsernameFlex"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "tempUsernameFlex", `
        flex: 1;
        text-align: center;
        align-self: center;
        font-weight: bold;
        font-size: 24px;
        font-family: helvetica, Tahoma, Arial;
      `);
  
    if (!HTMLUtilities.styleExists(PluginLoader.DEFAULT_CSS_ID, "tempUsername"))
      HTMLUtilities.createOrUpdateStyle(PluginLoader.DEFAULT_CSS_ID, "tempUsername", `
        line-height: 0.75em;
        padding: 0;
        padding-bottom: 0.2em;
        margin: auto;
        display: block;
        width: fit-content;
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
    previewSpan.innerHTML = `${label} <span>|</span> ${PartyListUtilities.findUser(label).character}`
  
    previewSpan.classList.add("tempUsername");
  
    previewDiv.appendChild(previewSpan);
  
    const selections = {};
  
    if (value.selection === "default") {
      previewSpan.style.background = "#418030";
    }
  
    const colour = document.createElement("input");
    colour.type = "color";
    colour.style.height = "40px";
  
    colour.addEventListener("input", (event) => {
      previewSpan.setAttribute("style", `background: ${event.target.value}; -webkit-background-clip: text;`);
      updateChatUI(label, {css: previewSpan.style, selection: "colour"});
    });
  
    const gradientData = {
      handleWidth: 10,
      handleInputWidth: 40,
      editorHeight: 30,
      handleBorder: 2
    }
  
    const gradientDiv = document.createElement("div");
    line2.style.height = `${10 + (gradientData.editorHeight * 2)}px`;
    
    gradientData.parent = gradientDiv;
  
    const gradientEditor = HTMLUtilities.createGradientEditor(gradientData);
  
    gradientEditor.getHTML().addEventListener("draw", (event) => {
      previewSpan.setAttribute("style", `background: ${event.detail}; -webkit-background-clip: text;`);
      updateChatUI(label, {css: previewSpan.style, selection: "gradient"});
    });
  
    const arr = Object.keys(GradientPresets).sort();
  
    const obj = {options: {}};
  
    arr.forEach((x) => {
      obj.options[x] = {
        label: Utilities.toTitleCase(x.replaceAll("_", " "))
      }
    });
  
    obj.defaultValue = Object.keys(obj.options)[0];
    obj.valueChanged = (event) => {
      previewSpan.setAttribute("style", `background: ${GradientPresets[event.target.value]}; -webkit-background-clip: text;`);
      updateChatUI(label, {css: previewSpan.style, selection: "preset"});
    }
    
    const presetSelect = HTMLUtilities.createSelection(obj);
    presetSelect.style.height = "40px";
  
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
        default: {
          label: "Default",
          callbacks: {
            visible: () => {
              previewSpan.setAttribute("style", `background: #418030; -webkit-background-clip: text;`);
              updateChatUI(label, {css: previewSpan.style, selection: "default"});
            }
          }
        },
        solid: {
          label: "Solid",
          callbacks: {
            visible: () => {
              previewSpan.setAttribute("style", `background: ${colour.value}; -webkit-background-clip: text;`);
              colour.classList.remove("hideInput");
            },
            hidden: () => {
              colour.classList.add("hideInput");
            }
          }
        },
        gradient: {
          label: "Gradient",
          callbacks: {
            visible: () => {
              gradientDiv.classList.remove("hideInput");
              gradientEditor.Visible = true;
            },
            hidden: () => {
              gradientDiv.classList.add("hideInput");
              gradientEditor.Visible = false;
            }
          }
        },
        preset: {
          label: "Preset",
          callbacks: {
            visible: () => {
              previewSpan.setAttribute("style", `background: ${GradientPresets[presetSelect.value]}; -webkit-background-clip: text;`);
              presetSelect.classList.remove("hideInput");
            },
            hidden: () => {
              presetSelect.classList.add("hideInput");
            }
          }
        }
      },
      defaultValue: value.selection
    };
    
    const colourType = HTMLUtilities.createSelection(colourTypeOptions);
    colourType.style.flex = "0.5";
    
    line1.append(colourType, previewDiv);
    
    colourTypeOptions.options[value.selection].callbacks.visible();

    return wrapperDiv;
  }
}