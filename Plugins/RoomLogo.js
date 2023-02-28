PartyList.render_room_info = function() {
  try {
    let image = document.createElement("img");
    let foundImage = custom_token_list.find(x => x.name === "RoomLogo.png");
    
    if(!foundImage)
      throw "Cannot find Room logo!";
    
    image.src = foundImage.url;
    image.style.width = "100%";
    
    document.getElementById("room_info").replaceChildren(image);
  } catch(e) {
    console.error(e);
  }
}