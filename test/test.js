var upnp = require("../");
//upnp.start();

//var ip = new upnp.IP();
//console.warn(ip.addresses());

var client = new upnp.Client();
client.search();
client.on('WANConnectionDevice', function(d){
	console.warn("got device", "InternetGatewayDevice");
	d.getService('WANIPConnection', function(service){
		service.post('GetExternalIPAddress', []).then((data)=>{
			console.warn('got data', data);
		});
//		service.start( function(soap){
//			console.warn("Service Started", soap);
//		});
	});
	//d.test();
});

//var s = new upnp.SSDP();
//console.warn(s.search('all'));
//
//console.warn(upnp);
//var u = new upnp.UpnpClient();
//u.start().then(d=>{
//	console.warn('Client started');
//	u.search();
//});
//console.warn(u.getInterfaces());

