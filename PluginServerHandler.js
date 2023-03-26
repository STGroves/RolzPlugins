import PartyListUtilities from "./PluginUtilities/PartyListUtilities.js";

export default {
  get MessageIDs() {
    return {
      CLIENT_TO_SERVER: "CSM",
      SERVER_TO_CLIENT: "SCM",
      CLIENT_TO_CLIENT: "CCM"
    };
  },

  get ConnectionStates() {
    return {
      MASTER: "MASTER",
      SLAVE: "SLAVE",
      MEMBER: "MEMBER"
    };
  },
  
  getConnectionState: function () {
    const STATE = this.ConnectionStates;

    if (PartyListUtilities.isGM())
      return STATE.MASTER;
  
    return PartyListUtilities.isGMPresent() ? STATE.SLAVE : STATE.MEMBER;
  },

  init: function () {
    DM.send = function(data) {
      const STATE = this.ConnectionStates;

      switch(getConnectionState()) {
        case STATE.MASTER:
          sendToClients(data);
          break;
        
        case STATE.SLAVE:
          sendToServer(data);
          break;
        
        case STATE.MEMBER:
          sendToOthers(data);
          break;
      }
    }

    document.onMessage = (msg) => {
      if (msg.type === "keep-alive-return")
        return;

      const {type, ...data} = msg;
      const USER_STATE = getConnectionState();
      const STATES = this.ConnectionState;
      const MSG_IDS = this.MessageIDs;

      if (!!data.pluginMessage)
      {
        switch(data.pluginMessage) {
          case MSG_IDS.SERVER_TO_CLIENT:
            if (USER_STATE === STATES.MASTER)
              return;
            
            document.dispatchEvent(new CustomEvent(MSG_IDS.SERVER_TO_CLIENT, {detail: msg}));
            return;
          
          case MSG_IDS.CLIENT_TO_SERVER:
            if (USER_STATE !== STATES.MASTER)
              return;
            
            document.dispatchEvent(new CustomEvent(MSG_IDS.CLIENT_TO_SERVER, {detail: msg}));
            return;
          
          case MSG_IDS.CLIENT_TO_CLIENT:
            if (USER_STATE !== STATES.MASTER)
              return;
            
            document.dispatchEvent(new CustomEvent(MSG_IDS.CLIENT_TO_CLIENT, {detail: msg}));
            return;
        }
      }

      document.dispatchEvent(new CustomEvent(type, {detail: data}));
    }
  }
}

function sendToServer(data) {
  data.pluginMessage = getMessageIDs().CLIENT_TO_SERVER;
  WSConnection.send({
    type: "client-tbl-mapdata",
    source_instance_id : WSConnection.options.conid,
    mapdata : data
  });
}

function sendToClients(data) {
  data.pluginMessage = getMessageIDs().SERVER_TO_CLIENT;
  WSConnection.send({
    type: "client-tbl-mapdata",
    source_instance_id : WSConnection.options.conid,
    mapdata : data
  });
}

function sendToOthers(data) {
  data.pluginMessage = getMessageIDs().CLIENT_TO_CLIENT;
  WSConnection.send({
    type: "client-tbl-mapdata",
    source_instance_id : WSConnection.options.conid,
    mapdata : data
  });
}