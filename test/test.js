var upnp = require("../");

var client = new upnp.Client();
client.search('urn:schemas-upnp-org:device:InternetGatewayDevice:1');
client.on('WANConnectionDevice', function(d){
	console.warn("got device", "InternetGatewayDevice");
	d.getService('WANIPConnection', function(service){
		service.post('GetExternalIPAddress', []).then((data)=>{
			console.warn('got data', data);
			service.post('AddPortMapping', {
				NewRemoteHost: '',
				NewExternalPort: 8888,
				NewProtocol: 'TCP',
				NewInternalPort: 80,
				NewInternalClient: d.network,
				NewEnabled: 1,
				NewPortMappingDescription: 'node:nat:upnp',
				NewLeaseDuration: 60 * 30
			}).then((forward)=>{
					console.warn('Port Mapping Response', forward)
					service.post('GetGenericPortMappingEntry', {'NewPortMappingIndex':0}).then((mapped)=>{
						console.warn("Mapped", mapped);
					});
				});
		});
		

	});
});