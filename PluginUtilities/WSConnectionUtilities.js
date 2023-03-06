import Utilities from "./Utilities.js";

export default function() {
  WSConnection.pluginData = {user: {}, creator: {}};
  let pluginDataTags = {user: [], creator: []};

  WSConnection.prepareUserSendPacket = function(packet) {
    const data = {type: "user_update", ...JSON.parse(JSON.stringify(packet))};

    if (Utilities.isEmptyObject(pluginData.user) && Utilities.isEmptyArray(pluginDataTags.user))
      return data;

    data.pluginData = JSON.parse(JSON.stringify(pluginData.user));
    data.pluginDataTags = JSON.parse(JSON.stringify(pluginDataTags.user));

    pluginData.user = {};
    pluginDataTags.user = [];

    return data;
  }

  WSConnection.prepareCreatorSendPacket = function(packet) {
    const data = {type: "creator_update", mapsettings: JSON.parse(JSON.stringify(packet))};

    if (Utilities.isEmptyObject(pluginData.creator) && Utilities.isEmptyArray(pluginDataTags.creator))
      return data;

    data.creator = JSON.parse(JSON.stringify(pluginData.creator));
    data.creator = JSON.parse(JSON.stringify(pluginDataTags.creator));

    pluginData.creator = {};
    pluginDataTags.creator = [];

    return data;
  }
}