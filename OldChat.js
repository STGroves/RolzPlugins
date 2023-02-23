document.getElementById("table-dock-tabs").remove();
document.getElementById("table-dock-resizer").remove();
document.getElementById("table-dock-container").remove();

if (!DM.userdata.hasOwnProperty("p_chat"))
  TableUI.pane.open({id:"chat", x: 0, y: window.innerHeight - 300, w: 750, h: 300, title: "Chat", noclose: true, content: $('#t-chat-view').html(), style: "overflow:hidden;"});
else
  TableUI.pane.open(DM.userdata.p_chat);

Chat.init();
