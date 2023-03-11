import Utilities from "./Utilities.js";

export default function() {
  const pluginData = {creator: {}, user: {}};

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

  WSConnection.addPluginUserTags = function (plugin, ...tags) {
    if (!pluginData.user[plugin]) {
      pluginData.user[plugin] = {data: {}, tags:[tags]};
      return;
    }

    if (!pluginData.user[plugin].tags) {
      pluginData.user[plugin].tags = [tags];
      return;
    }

    tags.forEach(tag => {  
      if (!pluginData.user[plugin].tags.includes(tag)) { 
        pluginData.user[plugin].tags.push(tag)
      }
    });
  }

  WSConnection.addPluginCreatorTags = function (plugin, ...tags) {
    if (!pluginData.creator[plugin]) {
      pluginData.creator[plugin] = {data: {}, tags:[tags]};
      return;
    }

    if (!pluginData.creator[plugin].tags) {
      pluginData.creator[plugin].tags = [tags];
      return;
    }

    tags.forEach(tag => {  
      if (!pluginData.creator[plugin].tags.includes(tag)) { 
        pluginData.creator[plugin].tags.push(tag)
      }
    });
  }

  WSConnection.addPluginUserData = function (plugin, data) {
    if (!pluginData.user[plugin]) {
      pluginData.user[plugin] = {data: data, tags:[]};
      return;
    }

    pluginData.user[plugin].data = data;
  }

  WSConnection.addPluginCreatorData = function (plugin, data) {
    if (!pluginData.creator[plugin]) {
      pluginData.creator[plugin] = {data: data, tags:[]};
      return;
    }

    pluginData.creator[plugin].data = data;
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
    const data = msg.detail.mapdata.pluginData;
    
    if (!allowUntagged && !data[plugin])
      return false;
    
    else if (allowUntagged)
      return true;
    
    for (const [_, tag] of blacklistTags) {
      if (data[plugin].tags.includes(tag))
        return false;
    }

    if (Utilities.isEmptyArray(whitelistTags))
      return true;

    for (const [_, tag] of whitelistTags) {
      if (data[plugin].tags.includes(tag))
        return true;
    }

    return false;
  }
}