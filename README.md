# UPNP TS
upnp-ts is a very basic upnp client for nodejs, written in typscript.  It was written to manage port forwarding, but is generic enough you should be able to accomplish most client tasks.

the package webpacks cleanly, and has minimal dependencies.  If using in nwjs or electron, keep in mind this will need to run on the nodejs thread.

### Install
```sh
$ npm install upnp-ts --save
```
### Usage

```sh
var upnp = require("upnp-ts");

let client = new upnp.Client();

//callback for once a device is found
client.onOneOf(['WANConnectionDevice', 'WANPPPConnection', 'LANDevice'], function( gateway ) {
    gateway.getService('WANIPConnection', function (service) {
        service.post('AddPortMapping', {
                NewRemoteHost: "",
                NewExternalPort: 8888,
                NewProtocol: 'TCP',
                NewInternalPort: 8888,
                NewInternalClient: d.network,
                NewEnabled: 1,
                NewPortMappingDescription: 'node:nat:upnp',
                NewLeaseDuration: 0
        }).then((portMapResponse) => {
                console.warn('port map response', portMapResponse);
        }).catch((err) => {
            console.warn('error mapping port', err);
        });
    }
});

//send out a discovery request;
client.search( 'urn:schemas-upnp-org:device:InternetGatewayDevice:1' );
```
