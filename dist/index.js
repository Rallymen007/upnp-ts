"use strict";
const events_1 = require("events");
const util_1 = require("./util");
const ssdp_1 = require("./ssdp");
var Upnp;
(function (Upnp) {
    class Client extends events_1.EventEmitter {
        constructor(opts) {
            super();
            this._ssdps = [];
            this._devices = [];
        }
        _debug(msg) {
            super.emit('debug', msg);
        }
        onOneOf(events, fn) {
            for (let e of events) {
                super.on(e, fn);
            }
        }
        getDevices() {
            return this._devices;
        }
        registerDevice(d) {
            let found = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                this._devices.push(d);
                super.emit('newdevice', d);
                super.emit(d.devicetype, d);
            }
        }
        search(searchtype) {
            this._debug(["Beginning search", searchtype]);
            if (!searchtype)
                searchtype = 'ssdp:all';
            let ipc = new util_1.IP();
            let ips = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new ssdp_1.SSDP((d) => { this._debug(d); }, ip));
            }
            for (let s of this._ssdps) {
                s.on('device', (device) => {
                    this._debug(['got device', device.devicetype]);
                    this.registerDevice(device);
                });
                s.on('ready', () => {
                    s.search(searchtype);
                });
            }
        }
        stopSearch() {
            for (let s of this._ssdps) {
                s.shutdown();
            }
        }
    }
    Upnp.Client = Client;
})(Upnp || (Upnp = {}));
module.exports = Upnp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290Ijoic3JjLyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG1DQUFzQztBQUN0QyxpQ0FBNEI7QUFDNUIsaUNBQThCO0FBRzlCLElBQU8sSUFBSSxDQWtFVjtBQWxFRCxXQUFPLElBQUk7SUFFUCxNQUFhLE1BQU8sU0FBUSxxQkFBWTtRQUlwQyxZQUFZLElBQVU7WUFDbEIsS0FBSyxFQUFFLENBQUM7WUFKWixXQUFNLEdBQWdCLEVBQUUsQ0FBQztZQUN6QixhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQUk3QixDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQVE7WUFDWCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsT0FBTyxDQUFDLE1BQXFCLEVBQUUsRUFBTTtZQUNqQyxLQUFLLElBQUksQ0FBQyxJQUFJLE1BQU0sRUFBRTtnQkFDbEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDO1FBRUQsVUFBVTtZQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBRUQsY0FBYyxDQUFDLENBQVM7WUFDcEIsSUFBSSxLQUFLLEdBQVksS0FBSyxDQUFDO1lBQzNCLEtBQUssSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDOUIsSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7b0JBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLEtBQUssR0FBRyxJQUFJLENBQUM7aUJBQ2hCO2FBQ0o7WUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25DO1FBQ0wsQ0FBQztRQUVELE1BQU0sQ0FBQyxVQUFtQjtZQUV0QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVTtnQkFBRSxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3pDLElBQUksR0FBRyxHQUFPLElBQUksU0FBRSxFQUFFLENBQUM7WUFDdkIsSUFBSSxHQUFHLEdBQVEsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQy9CLEtBQUssSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFBLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN2QixDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFO29CQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQztnQkFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRyxHQUFHLEVBQUU7b0JBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDO1FBRUQsVUFBVTtZQUNOLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQztLQUNKO0lBL0RZLFdBQU0sU0ErRGxCLENBQUE7QUFDTCxDQUFDLEVBbEVNLElBQUksS0FBSixJQUFJLFFBa0VWO0FBRUQsaUJBQVMsSUFBSSxDQUFDIn0=