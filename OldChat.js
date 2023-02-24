if (!DM.userdata.hasOwnProperty("p_plugin_chat"))
  TableUI.pane.open({id:"plugin_chat", x: 0, y: 66, w: 40, h: 33, title: "Chat", noclose: true, style: "overflow:hidden;"});
else
  TableUI.pane.open(DM.userdata.p_chat);

let content = document.getElementById("view-plugin_chat-content");
let chatContent = document.getElementById("view-chat-content");
let output = document.getElementById("output");
let chatInput = document.getElementById("prompt-line-lower");
	
output.style = "bottom: 36px";
chatInput.style = "bottom: 0; left: 0; right: 0; margin: 0";
	
content.append(chatContent);

document.getElementById("view-chat").remove();
document.getElementById("tgb-chat").remove();

let tabs = document.getElementById("table-dock-tabs");

if (tabs.childNodes.length === 0) {
  document.getElementById("table-dock-tabs").remove();
  document.getElementById("table-dock-resizer").remove();
  document.getElementById("table-dock-container").remove();
}