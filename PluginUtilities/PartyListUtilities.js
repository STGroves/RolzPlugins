const SELF = WSConnection.options.nick;
const ROOM_CREATOR = WSConnection.options.room_data.creator;

function isGM() {
  return ROOM_CREATOR === SELF;
}

function isGMPresent() {
  return Object.entries(PartyList.members).find(x => x[1].nick === WSConnection.options.room_data.creator) !== undefined;
}

function findUser(username) {
  return Object.values(PartyList.members).find(x => x.nick === username);
}

export default {
  isGM,
  isGMPresent,
  findUser,
  SELF,
  ROOM_CREATOR
}