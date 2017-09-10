var upnp = require("../");

var client = new upnp.Client();
client.on('debug', (msg) => {
    console.warn('debug: ', msg);
});

client.search('urn:schemas-upnp-org:device:InternetGatewayDevice:1');
client.onOneOf(['WANConnectionDevice', 'WANPPPConnection', 'LANDevice'], function (d) {
    console.warn("got WANConnectionDevice", d.devicetype);
    d.getService('WANIPConnection', function (service) {
        service.post('GetExternalIPAddress', []).then((external) => {
            console.warn('got data', external);
            service.post('AddPortMapping', {
                NewRemoteHost: "",
                NewExternalPort: 8888,
                NewProtocol: 'TCP',
                NewInternalPort: 8888,
                NewInternalClient: d.network,
                NewEnabled: 1,
                NewPortMappingDescription: 'node:nat:upnp',
                NewLeaseDuration: 0
            }).then((forward) => {
                console.warn('Port Mapping Response', forward)
                //service.post('GetGenericPortMappingEntry', { 'NewPortMappingIndex': 0 }).then((mapped) => {
                //    console.warn("Mapped", mapped);
                //});
            }).catch((err) => {
                console.warn("Port Mapping Error", err.children);
                debugger;
            });
        }).catch((err) => {
            console.warn("Error getting External IP", err);
            });


    });
});
