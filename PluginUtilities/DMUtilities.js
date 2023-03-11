export default function() {
  DM.send = function(data) {
    const noPluginData = JSON.parse(JSON.stringify(data));
    delete noPluginData.pluginData;

    DM.dispatch_update_message(noPluginData, true, true);
		
    WSConnection.send({
			type : 'client-tbl-mapdata',
			source_instance_id : WSConnection.options.conid,
			mapdata : data,
		});
  }
}