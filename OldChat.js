if (!DM.userdata.hasOwnProperty("p_chat"))
  TableUI.pane.open({id:"chat", x: 0, y: 89, w: 33, h: 15, title: "Chat", noclose: true, style: "overflow:hidden;"});
else
  TableUI.pane.open(DM.userdata.p_chat);

let content = document.getElementById("view-chat-content");
let output = document.getElementById("output");
let chatInput = document.getElementById("prompt-line-lower");
	
output.style = "bottom: 38px";
chatInput.style = "bottom: 0; left: 0; right: 0; margin: 0";
	
content.append(output);
content.append(chatInput);

document.getElementById("table-dock-tabs").remove();
document.getElementById("table-dock-resizer").remove();
document.getElementById("table-dock-container").remove();