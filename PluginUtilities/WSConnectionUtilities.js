import Utilities from "./Utilities.js";

export default function() {
  const pluginData = {user: {}, creator: {}};
  const pluginDataTags = {user: [], creator: []};

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

    data.pluginData = JSON.parse(JSON.stringify(pluginData.creator));
    data.pluginDataTags = JSON.parse(JSON.stringify(pluginDataTags.creator));

    pluginData.creator = {};
    pluginDataTags.creator = [];

    return data;
  }

  WSConnection.addPluginUserTag = function (tag) {
    if (!pluginDataTags.user.includes(tag))
      pluginDataTags.user.push(tag)
  }

  WSConnection.addPluginCreatorTag = function (tag) {
    if (!pluginDataTags.creator.includes(tag))
      pluginDataTags.creator.push(tag)
  }

  WSConnection.addPluginUserData = function (plugin, data) {
    pluginData.user[plugin] = data;
  }

  WSConnection.addPluginCreatorData = function (plugin, data) {
    pluginData.creator[plugin] = data;
  }
  
  WSConnection.getPluginCreatorData = function (plugin) {
    if (!!pluginData.creator[plugin])
      return pluginData.creator[plugin];
    
    return undefined;
  }

  WSConnection.getPluginUserData = function (plugin) {
    if (!!pluginData.user[plugin])
      return pluginData.user[plugin];
    
    return undefined;
  }

  WSConnection.filterMessage = function (msg, plugin, allowUntagged, whitelistTags, blacklistTags) {
    if (!allowUntagged && !msg.detail.mapdata.pluginData.user[plugin] && !msg.detail.mapdata.pluginData.creator[plugin])
      return false;
    
    else if (allowUntagged)
      return true;
    
    for (const tag in blacklistTags) {
      if (msg.details.mapdata.pluginDataTags.user.includes(tag) || msg.details.mapdata.pluginDataTags.creator.includes(tag))
        return false;
    }

    for (const tag in whitelistTags) {
      if (msg.details.mapdata.pluginDataTags.user.includes(tag) || msg.details.mapdata.pluginDataTags.creator.includes(tag))
        return true;
    }

    return false;
  }
}