import Utilities from "./Utilities.js";

export default function() {
  const pluginData = {};

  WSConnection.prepareUserSendPacket = function(packet) {
    const data = {type: "user_update", ...JSON.parse(JSON.stringify(packet))};

    if (Utilities.isEmptyObject(pluginData))
      return data;

    data.pluginData = JSON.parse(JSON.stringify(pluginData.user));

    pluginData.user = {};

    return data;
  }

  WSConnection.prepareCreatorSendPacket = function(packet) {
    const data = {type: "creator_update", mapsettings: JSON.parse(JSON.stringify(packet))};

    if (Utilities.isEmptyObject(pluginData.creator))
      return data;

    data.pluginData = JSON.parse(JSON.stringify(pluginData.creator));
    
    pluginData.creator = {};
    
    return data;
  }

  WSConnection.addPluginUserTag = function (plugin, tag) {
    if (!pluginData.user[plugin]) {
      pluginData.user[plugin] = {data: {}, tags:[tag]};
      return;
    }

    if (!pluginData.user[plugin].tags) {
      pluginData.user[plugin].tags = [tag];
      return;
    }

    if (!pluginData.user[plugin].tags.includes(tag)) { 
      pluginData.user[plugin].tags.push(tag)
    }
  }

  WSConnection.addPluginCreatorTag = function (plugin, tag) {
    if (!pluginData.creator[plugin]) {
      pluginData.creator[plugin] = {data: {}, tags:[tag]};
      return;
    }

    if (!pluginData.creator[plugin].tags) {
      pluginData.creator[plugin].tags = [tag];
      return;
    }

    if (!pluginData.creator[plugin].tags.includes(tag)) { 
      pluginData.creator[plugin].tags.push(tag)
    }
  }

  WSConnection.addPluginUserData = function (plugin, data) {
    if (!pluginData.user[plugin]) {
      pluginData.user[plugin] = {data: data, tags:[]};
      return;
    }

    if (!pluginData.user[plugin].data) {
      pluginData.user[plugin].data = data;
      return;
    }
  }

  WSConnection.addPluginCreatorData = function (plugin, data) {
    if (!pluginData.creator[plugin]) {
      pluginData.creator[plugin] = {data: data, tags:[]};
      return;
    }

    if (!pluginData.creator[plugin].data) {
      pluginData.creator[plugin].data = data;
      return;
    }
  }

  WSConnection.getPluginUserData = function (plugin) {
    if (!!pluginData.user[plugin])
      return pluginData.user[plugin];
    
    return undefined;
  }

  WSConnection.getPluginCreatorData = function (plugin) {
    if (!!pluginData.creator[plugin])
      return pluginData.creator[plugin];
    
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