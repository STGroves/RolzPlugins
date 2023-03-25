export default {
  get SELF() { return WSConnection.options.nick },
  get ROOM_CREATOR() { return WSConnection.options.room_data.creator },
  isGM: function () {
    return this.ROOM_CREATOR === this.SELF;
  },
  isGMPresent: function () {
    return Object.entries(PartyList.members).find(x => x[1].nick === this.ROOM_CREATOR) !== undefined;
  },
  findUser: function (username) {
    return Object.values(PartyList.members).find(x => x.nick === username);
  }
}