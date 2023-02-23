document.getElementById("table-dock-tabs").remove();
document.getElementById("table-dock-resizer").remove();
document.getElementById("table-dock-container").remove();

if (!DM.userdata.hasOwnProperty("p_chat"))
  TableUI.pane.open({id:"chat", x:0, y:window.innerHeight - 300, width:750, height:300, title: "Chat", noclose: true, content: `
	<div id="output" style="margin:0;margin-top:4px;" role="log" aria-live="assertive">...loading...</div>

	<div id="prompt-line-lower">
		<div id="prompt-elements">
			<div id="my_nick" style="padding: 7px;text-align: right;">SAY</div>
			<input type="text" id="prompt-element" value="" autocomplete="off"
				placeholder="type chat message here..."
				onkeyup="$('#send-chat-button').css('opacity', ($(this).val() == '' ? 0.3 : 1.0));"
				onkeydown="Chat.key_down(event);"/>
			<button style="opacity:0.3" id="send-chat-button" onclick="sendLine();" title="send chat">
				<i class="fa fa-paper-plane"></i>
			</button>
			<button onclick="document.select_image_file(0);" title="attach image">
				<i class="fa fa-paperclip"></i>
			</button>
		</div>
	</div>
`, style: "overflow:hidden;"});
else
  TableUI.pane.open(DM.userdata.p_chat);
