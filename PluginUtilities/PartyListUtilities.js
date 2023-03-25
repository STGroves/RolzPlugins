export default function () {
  const selfThis = this;

  Object.defineProperty(selfThis, "SELF", {
    get: function() { return WSConnection.options.nick }
  });

  Object.defineProperty(selfThis, "ROOM_CREATOR", {
    get: function() { return WSConnection.options.room_data.creator }
  });

  this.isGM = function () {
    return this.ROOM_CREATOR === this.SELF;
  }

  this.isGMPresent = function () {
    return Object.entries(PartyList.members).find(x => x[1].nick === this.ROOM_CREATOR) !== undefined;
  }

  this.findUser = function (username) {
    return Object.values(PartyList.members).find(x => x.nick === username);
  }

  return this;
}