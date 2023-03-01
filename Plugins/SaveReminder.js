import HTMLUtilities from "../PluginUtilities/HTMLUtilities.js"

HTMLUtilities.createOrUpdateStyle("PluginCSS", `#back {
  background-color: rgba(0,0,0,0.5);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#btnSelect {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
}

#UI {
  background-color: black;
  color: white;
  text-align: center;
  padding: 25px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0px 0px 10px 10px;
  font-weight: bold;
  font-family: helvetica, Tahoma, Arial;
}

.saveButton {
  color: black;
  cursor: pointer;
  padding: 6px;
  margin-top: -2px;
  font-weight: bold;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 3px;
  background: rgba(160,160,160,0.5);
  border: 2px solid rgba(160,160,160,0.5);
  margin-bottom: 2px;
  font-family: helvetica, Tahoma, Arial;
  font-size: 14px;
}

.saveButton:hover {
  background: rgba(0,0,0,0.5);
  color: white;
  border-color: yellow;
}`);

let autosave = function() {
  DM.send({
    'type' : 'save_map',
    'savetitle' : document.getElementById('save-map-title').value
  });
}

setInterval(autosave, 30000);

let pluginSave = document.createElement("div");
pluginSave.innerHTML = `<div id="back"/>
  <div id="UI">
    Do you wish to save before leaving?
    <div id="btnSelect">
      <button id="prompt-window-save-btn" class="saveButton" style="min-width: 120px; background: rgb(0, 255, 150); display: inline-block;" onclick="document.getElementById('pluginSave').style.display = 'none'; DM.view.save_map();">
        Yes
      </button>
      <button id="prompt-window-cancel-btn" class="saveButton" style="background-color: rgb(255, 50, 0); display: inline-block; min-width: 120px;" onclick="document.getElementById('pluginSave').style.display = 'none'; ">
        No
      </button>
    </div>
  </div>
</div>`;
pluginSave.style.display = "none";
pluginSave.style.zIndex = 100000000000;
document.body.append(pluginSave);

window.onbeforeunload((event) => {
  console.log(event);
  event.preventDefault();
});